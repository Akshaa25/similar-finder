import numpy as np

def normalize(v):
    v = np.array(v)
    norm = np.linalg.norm(v)
    return v / norm if norm != 0 else v


def cosine_similarity(a, b):
    a = normalize(a)
    b = normalize(b)
    return float(np.dot(a, b))


def rank_similar_questions(target_emb, questions, top_k=5, threshold=0.45):
    results = []

    for q in questions:
        if not q.get("embedding"):
            continue

        score = cosine_similarity(target_emb, q["embedding"])

        if score >= threshold:
            results.append({
                "question": q["question"],
                "score": round(score, 4),
                "topicTag": q.get("topicTag", "General")
            })

    results.sort(key=lambda x: x["score"], reverse=True)

    return results[:top_k]