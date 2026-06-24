# 📚 AI Study Assistant – Similar Question Finder

A smart AI-powered study assistant that helps students ask questions and instantly find **similar previously asked questions using semantic search (AI embeddings)** instead of simple keyword matching.

---

## 🚀 Live Idea

You type a question like:

> "What is React Hooks?"

And the system intelligently finds:

- How do React Hooks manage state?
- What is useState in React?
- Difference between class components and hooks

---

## ✨ Features

- 🔐 User Authentication (Register / Login)
- ❓ Ask any study question
- 🧠 AI-based semantic similarity search
- 🔍 Finds most similar past questions
- 🏷️ Auto topic detection (React, Python, Math, etc.)
- 📊 Dashboard with live stats
- 📜 History of all questions
- 📈 Similarity score with progress bar UI
- ⚡ Fast and responsive interface

---

## 🧠 How it works (AI logic)

1. Each question is converted into a **vector embedding**
2. New question is also converted into embedding
3. System calculates **cosine similarity**
4. Most similar questions are returned
5. Question is also assigned a **topic tag**

👉 This makes search meaning-based, not keyword-based.

---

## 🛠️ Tech Stack

### Frontend
- React (Vite)
- Axios
- React Router
- CSS

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication

### AI Service
- FastAPI (Python)
- Sentence Transformers
- Cosine Similarity

---

## 📂 Project Structure
edutech/
│
├── frontend/ # React frontend (Vercel)
├── backend/ # Node.js backend (Render)
├── ai-service/ # AI similarity engine (Render)

Backend setup:
cd backend
npm install
node server.js

Frontend Setup:
cd frontend
cd vite 
npm install
npm run dev

AI Service Setup:
cd ai-service
pip install -r requirements.txt
uvicorn app:app --reload

Deployment:
Frontend → Vercel
Backend → Render
AI Service → Render

Important Notes
Uses real AI embeddings for similarity search
Works end-to-end with database storage
Fully functional full-stack AI project
Designed for academic evaluation and demonstration
👨‍💻 Author

Built with ❤️ by Akshaa25

⭐ If you like this project

Give it a star ⭐ on GitHub!
