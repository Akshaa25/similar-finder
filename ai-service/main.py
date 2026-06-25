from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import numpy as np

app = FastAPI()

print("🔥 SERVER STARTING...")

model = None
topic_embeddings = {}


TOPICS = {
    "React": "React frontend hooks state component SPA",
    "NodeJS": "NodeJS backend runtime server API",
    "ExpressJS": "Express middleware routing REST API",
    "MongoDB": "MongoDB database collections documents",
    "Python": "Python programming machine learning",
    "Java": "Java OOP Spring Boot",
    "JavaScript": "JavaScript web language"
}


class QuestionRequest(BaseModel):
    question: str


class SimilarRequest(BaseModel):
    embedding: list
    questions: list


def normalize(vec):
    vec = np.array(vec)
    norm = np.linalg.norm(vec)

    if norm == 0:
        return vec

    return vec / norm


def cosine_similarity(a, b):
    a = normalize(a)
    b = normalize(b)

    return float(np.dot(a, b))


@app.on_event("startup")
def load_model():
    global model
    global topic_embeddings

    print("Loading model...")

    model = SentenceTransformer(
        "all-MiniLM-L6-v2"
    )

    print("Model loaded")

    topic_embeddings = {}

    for topic, text in TOPICS.items():
        emb = model.encode(text)

        topic_embeddings[topic] = normalize(
            emb
        )

    print("Topic embeddings loaded")


@app.get("/")
def home():
    return {
        "message": "AI Running"
    }


@app.post("/analyze")
def analyze(data: QuestionRequest):

    question_embedding = model.encode(
        data.question
    )

    question_embedding = normalize(
        question_embedding
    )

    best_topic = "General"
    best_score = 0

    for topic, emb in topic_embeddings.items():

        score = cosine_similarity(
            question_embedding,
            emb
        )

        if score > best_score:
            best_score = score
            best_topic = topic

    if best_score < 0.35:
        best_topic = "General"

    return {

        "topicTag": best_topic,

        "confidence": round(
            best_score,
            4
        ),

        "embedding":
        question_embedding.tolist()

    }


@app.post("/similar")
def similar(data: SimilarRequest):

    target_embedding = np.array(
        data.embedding
    )

    results = []

    for q in data.questions:

        if len(q["embedding"]) == 0:
            continue

        emb = np.array(
            q["embedding"]
        )

        score = cosine_similarity(
            target_embedding,
            emb
        )

        if score >= 0.45:

            results.append({

                "question":
                q["question"],

                "topicTag":
                q["topicTag"],

                "score":
                round(score, 4)

            })

    seen = set()
    unique = []

    for item in results:

        if item["question"] not in seen:

            seen.add(
                item["question"]
            )

            unique.append(
                item
            )

    unique = sorted(

        unique,

        key=lambda x:
        x["score"],

        reverse=True

    )

    return {

        "results":
        unique[:5]

    }