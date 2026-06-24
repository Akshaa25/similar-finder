from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import numpy as np


app = FastAPI()


model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)



class QuestionRequest(BaseModel):
    question:str

class SimilarRequest(BaseModel):
    embedding: list
    questions: list

TOPICS={

"React":"React frontend hooks state component SPA",

"NodeJS":"NodeJS backend runtime server API",

"ExpressJS":"Express middleware routing REST API",

"MongoDB":"MongoDB database collections documents",

"Python":"Python programming machine learning",

"Java":"Java OOP Spring Boot",

"JavaScript":"JavaScript web language"

}




def normalize(vec):

    vec=np.array(vec)

    norm=np.linalg.norm(vec)

    return vec/norm




def cosine_similarity(a,b):

    a=normalize(a)

    b=normalize(b)

    return float(np.dot(a,b))




topic_embeddings={}


for topic,text in TOPICS.items():

    emb=model.encode(text)

    topic_embeddings[topic]=normalize(emb)




@app.get("/")
def home():

    return {

        "message":"AI Running"

    }




@app.post("/analyze")
def analyze(data:QuestionRequest):



    question_embedding=model.encode(

        data.question

    )


    question_embedding=normalize(

        question_embedding

    )




    best_topic="General"

    best_score=0




    for topic,emb in topic_embeddings.items():


        score=cosine_similarity(

            question_embedding,

            emb

        )



        if score>best_score:

            best_score=score

            best_topic=topic




    if best_score<0.35:

        best_topic="General"



    return{


        "topicTag":best_topic,


        "confidence":round(

            best_score,

            4

        ),



        "embedding":

        question_embedding.tolist()



    }
@app.post("/similar")
def similar(data: SimilarRequest):

    target_embedding = np.array(data.embedding)

    results = []

    for q in data.questions:

        if len(q["embedding"]) == 0:
            continue

        emb = np.array(q["embedding"])

        score = cosine_similarity(
            target_embedding,
            emb
        )

        if score >= 0.45:

            results.append({

                "question": q["question"],
                "topicTag": q["topicTag"],
                "score": round(score, 4)

            })

    # -----------------------------
    # REMOVE DUPLICATE QUESTIONS
    # -----------------------------
    seen = set()
    unique = []

    for item in results:

        if item["question"] not in seen:

            seen.add(item["question"])
            unique.append(item)

    results = unique

    # -----------------------------
    # SORT FINAL RESULTS
    # -----------------------------
    results = sorted(
        results,
        key=lambda x: x["score"],
        reverse=True
    )

    return {
        "results": results[:5]
    }