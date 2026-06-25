console.log("SERVER.JS LOADED");
const axios = require("axios");
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   MongoDB Connection
========================= */

mongoose
.connect(process.env.MONGO_URI)
.then(async ()=>{
  console.log("✅ MongoDB Connected");
  try {
    if (typeof seedSampleQuestions === 'function') {
      await seedSampleQuestions();
    }
  } catch (e) {
    console.error("Error running seedSampleQuestions on startup:", e);
  }
})

.catch((err)=>{

console.log("❌ DB Error");

console.dir(err,{depth:null});

});


/* =========================
   USER SCHEMA
========================= */

const userSchema = new mongoose.Schema(

{

name:{
type:String,
required:true
},

email:{
type:String,
required:true,
unique:true
},

password:{
type:String,
required:true
}

},

{
timestamps:true
}

);


const User = mongoose.model(
"User",
userSchema
);



/* =========================
   QUESTION SCHEMA
========================= */

const questionSchema = new mongoose.Schema({

userId:{
type:mongoose.Schema.Types.ObjectId,
ref:"User"
},

question:{
type:String,
required:true
},

topicTag:{
type:String,
default:"General"
},

embedding:{
type:[Number],
default:[]
},

similarQuestions:{
type:[String],
default:[]
},

isSeeded:{
type:Boolean,
default:false
}

},{
timestamps:true
});


const Question = mongoose.model(
"Question",
questionSchema
);

const sampleQuestions = [
  // ── React (10) ──────────────────────────────────────────────────────
  "What is React and how does it differ from vanilla JavaScript?",
  "How do React hooks like useState and useEffect work?",
  "Explain the concept of React component lifecycle methods.",
  "What is JSX and how does Babel transform it?",
  "How does the React virtual DOM improve rendering performance?",
  "What is the difference between props and state in React?",
  "How do you manage global state in React using Context API?",
  "What are React custom hooks and when should you use them?",
  "How does React handle form inputs and controlled components?",
  "What is React Router and how do you implement client-side routing?",

  // ── JavaScript (8) ──────────────────────────────────────────────────
  "What are closures in JavaScript and why are they useful?",
  "Explain the JavaScript event loop and call stack in detail.",
  "What is the difference between var, let, and const in JavaScript?",
  "How do JavaScript promises work and what is async/await?",
  "What is prototypal inheritance in JavaScript?",
  "How does hoisting work in JavaScript?",
  "What are JavaScript arrow functions and lexical this binding?",
  "Explain destructuring assignment in JavaScript with examples.",

  // ── NodeJS (7) ──────────────────────────────────────────────────────
  "What is Node.js and how does it handle asynchronous operations?",
  "How does the Node.js event-driven architecture work?",
  "What is npm and how do you manage packages in Node.js?",
  "How do you create a simple HTTP server using Node.js core modules?",
  "What are Node.js streams and when should you use them?",
  "How does Node.js handle file system operations asynchronously?",
  "What is the difference between require and ES module import in Node.js?",

  // ── ExpressJS (5) ───────────────────────────────────────────────────
  "How do you set up a REST API using Express.js?",
  "What is Express middleware and how does the middleware chain work?",
  "How do you handle routing and route parameters in Express?",
  "How do you implement error handling middleware in Express.js?",
  "How do you secure an Express API using JWT authentication?",

  // ── MongoDB (5) ─────────────────────────────────────────────────────
  "What is MongoDB and how is it different from SQL databases?",
  "How do MongoDB collections and documents work?",
  "What is indexing in MongoDB and how does it speed up queries?",
  "How does the MongoDB aggregation pipeline work?",
  "How do you model relationships in MongoDB using references vs embedding?",

  // ── Python (5) ──────────────────────────────────────────────────────
  "What are Python decorators and how do you create one?",
  "Explain list comprehensions and generators in Python.",
  "What is the difference between deep copy and shallow copy in Python?",
  "How does Python handle memory management and garbage collection?",
  "What are Python virtual environments and why are they used?",

  // ── Java (5) ────────────────────────────────────────────────────────
  "What is the JVM and how does Java bytecode execution work?",
  "Explain object-oriented principles: encapsulation, inheritance, polymorphism.",
  "What is the difference between an abstract class and an interface in Java?",
  "How does Spring Boot auto-configuration work?",
  "What are Java generics and why are they used?",

  // ── Data Structures & Algorithms (5) ────────────────────────────────
  "What is binary search and what is its time complexity?",
  "How does a linked list differ from an array in memory?",
  "What is a stack data structure and what are its real-world uses?",
  "How does a binary search tree maintain sorted order?",
  "What is the difference between BFS and DFS graph traversal?"
];

async function seedSampleQuestions() {
  try {
    // Delete any existing seeded questions to ensure a fresh, clean, and complete set of 50 mock questions.
    await Question.deleteMany({ isSeeded: true });
    
    console.log("🌱 Seeding " + sampleQuestions.length + " sample questions...");
    const questionsToInsert = sampleQuestions.map(q => {
      const mockResult = mockAnalyzeQuestion(q);
      return {
        question: q,
        topicTag: mockResult.topicTag,
        embedding: mockResult.embedding,
        isSeeded: true,
        similarQuestions: []
      };
    });
    
    await Question.insertMany(questionsToInsert);
    console.log("✅ Successfully seeded " + sampleQuestions.length + " sample questions!");
    
    // Now, compute similar questions for all seeded questions!
    const allSeeded = await Question.find({ isSeeded: true });
    for (const q of allSeeded) {
      const otherQuestions = allSeeded.filter(other => other._id.toString() !== q._id.toString());
      const similar = mockRankSimilarQuestions(q.embedding, otherQuestions);
      await Question.findByIdAndUpdate(q._id, {
        similarQuestions: similar.map(s => s.question)
      });
    }
    console.log("✅ Pre-calculated similar questions for all seeded questions!");
  } catch (error) {
    console.error("❌ Error seeding questions:", error);
  }
}



/* =========================
JWT MIDDLEWARE
========================= */

const authMiddleware=(req,res,next)=>{

try{


const authHeader=req.headers.authorization;


if(!authHeader){

return res.status(401).json({

message:"No token provided"

})

}



const token=
authHeader.split(" ")[1];



const decoded=jwt.verify(

token,

process.env.JWT_SECRET

);



req.user=decoded;


next();

}

catch(error){

return res.status(401).json({

message:"Invalid token"

})

}


};



/* =========================
HOME
========================= */

app.get("/",(req,res)=>{


res.json({

message:"Backend Running 🚀"

})

});



/* =========================
SIGNUP
========================= */

app.post(

"/auth/signup",

async(req,res)=>{


try{


const {
name,
email,
password
}=req.body;



const existingUser=
await User.findOne({

email

});



if(existingUser){

return res.status(400).json({

message:"User already exists"

})

}



const hashedPassword=
await bcrypt.hash(password,10);



const user=await User.create({

name,
email,
password:hashedPassword

});



res.status(201).json({

success:true,

message:"User registered successfully",

userId:user._id

});



}

catch(error){

res.status(500).json({

message:error.message

})

}


});



/* =========================
LOGIN
========================= */


app.post(

"/auth/login",

async(req,res)=>{


try{


const {
email,
password
}=req.body;



const user=
await User.findOne({

email

});



if(!user){

return res.status(400).json({

message:"Invalid Email or Password"

})

}



const isMatch=
await bcrypt.compare(

password,
user.password

);



if(!isMatch){

return res.status(400).json({

message:"Invalid Email or Password"

})

}



const token=jwt.sign(

{

id:user._id,

email:user.email

},

process.env.JWT_SECRET,

{

expiresIn:"1d"

}

);



res.json({

success:true,

token,

user:{


id:user._id,

name:user.name,

email:user.email


}

});


}


catch(error){


res.status(500).json({

message:error.message

})


}


});



/* =========================
PROFILE API
========================= */


app.get(

"/auth/profile",

authMiddleware,

async(req,res)=>{


try{


const user=
await User.findById(

req.user.id

)

.select("-password");



if(!user){

return res.status(404).json({

message:"User not found"

})

}



res.json({

success:true,

user

});


}


catch(error){


res.status(500).json({

message:error.message

})

}



});


/* =========================
   TOPIC TAG FALLBACK
========================= */
/* =========================
   TOPIC TAG FALLBACK
========================= */

function generateMockEmbedding(text) {
  const size = 384;
  const vec = new Array(size).fill(0);
  if (!text) return vec;
  
  const words = text.toLowerCase().match(/\w+/g) || [];
  for (const word of words) {
    for (let i = 0; i < 5; i++) {
      let hash = 0;
      for (let j = 0; j < word.length; j++) {
        hash = (hash * 31 + word.charCodeAt(j) + i) % size;
      }
      vec[hash] += 1.0;
    }
  }
  
  let sumSq = 0;
  for (let i = 0; i < size; i++) {
    sumSq += vec[i] * vec[i];
  }
  const norm = Math.sqrt(sumSq);
  if (norm > 0) {
    for (let i = 0; i < size; i++) {
      vec[i] = vec[i] / norm;
    }
  }
  return vec;
}

function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

const TOPICS = {
  "React": "React frontend hooks state component SPA",
  "NodeJS": "NodeJS backend runtime server API",
  "ExpressJS": "Express middleware routing REST API",
  "MongoDB": "MongoDB database collections documents",
  "Python": "Python programming machine learning",
  "Java": "Java OOP Spring Boot",
  "JavaScript": "JavaScript web language"
};

const TOPIC_EMBEDDINGS = {};
for (const [topic, text] of Object.entries(TOPICS)) {
  TOPIC_EMBEDDINGS[topic] = generateMockEmbedding(text);
}

function mockAnalyzeQuestion(question) {
  const embedding = generateMockEmbedding(question);
  let bestTopic = "General";
  let bestScore = 0;
  
  for (const [topic, topicEmb] of Object.entries(TOPIC_EMBEDDINGS)) {
    const score = cosineSimilarity(embedding, topicEmb);
    if (score > bestScore) {
      bestScore = score;
      bestTopic = topic;
    }
  }
  
  if (bestScore < 0.35) {
    bestTopic = "General";
  }
  
  return {
    topicTag: bestTopic,
    confidence: parseFloat(bestScore.toFixed(4)),
    embedding: embedding
  };
}

function mockRankSimilarQuestions(targetEmbedding, questions, threshold = 0.30) {
  const results = [];
  
  for (const q of questions) {
    if (!q.embedding || q.embedding.length === 0) {
      q.embedding = generateMockEmbedding(q.question);
    }
    
    const score = cosineSimilarity(targetEmbedding, q.embedding);
    if (score >= threshold) {
      results.push({
        question: q.question,
        topicTag: q.topicTag || "General",
        score: parseFloat(score.toFixed(4))
      });
    }
  }
  
  const seen = new Set();
  const uniqueResults = [];
  for (const item of results) {
    if (!seen.has(item.question)) {
      seen.add(item.question);
      uniqueResults.push(item);
    }
  }
  
  uniqueResults.sort((a, b) => b.score - a.score);
  
  return uniqueResults.slice(0, 5);
}

function getTopicTag(question) {
  return mockAnalyzeQuestion(question).topicTag;
}
/* =========================
   ASK QUESTION (AI + EMBEDDING)
========================= */
/* =========================
ASK QUESTION
========================= */

app.post("/questions/ask",authMiddleware,async(req,res)=>{

console.log("ASK API HIT");

try{

const {question}=req.body;


if(!question || !question.trim()){
return res.status(400).json({
message:"Question required"
});
}



let aiResponse;
let topicTag = "General";
let embedding = [];
let confidence = 0;

try{

aiResponse=await axios.post(

"http://127.0.0.1:8000/analyze",

{question}

);

topicTag = aiResponse?.data?.topicTag || "General";
embedding = aiResponse?.data?.embedding || [];
confidence = aiResponse?.data?.confidence || 0;

}
catch(err){

console.log("AI Error: Service down. Falling back to local mock AI.");
const mockResult = mockAnalyzeQuestion(question);
topicTag = mockResult.topicTag;
embedding = mockResult.embedding;
confidence = mockResult.confidence;

}





const savedQuestion=
await Question.create({

userId:req.user.id,

question,

topicTag,

embedding,

similarQuestions:[]

});



const previousQuestions =
await Question.find({

$or:[

{isSeeded:true},

{userId:req.user.id}

],

_id:{

$ne:savedQuestion._id

}

});


console.log("==========");
console.log("TOTAL QUESTIONS");
console.log(previousQuestions.length);

console.log("SEEDED QUESTIONS");

console.log(
previousQuestions.filter(
q=>q.isSeeded===true
).length
);

console.log("VALID EMBEDDINGS");

console.log(
previousQuestions.filter(
q=>q.embedding.length>0
).length
);

console.log("==========");

let similarResponse;
try {
  similarResponse = await axios.post(
    "http://127.0.0.1:8000/similar",
    {
      embedding: savedQuestion.embedding,
      questions: previousQuestions
        .filter(q => q.embedding.length > 0)
        .map(q => ({
          question: q.question,
          embedding: q.embedding,
          topicTag: q.topicTag
        }))
    }
  );
} catch (err) {
  console.log("AI Similar Error: Service down. Falling back to local mock similarity search.");
  const previousWithEmbs = previousQuestions.map(q => {
    if (!q.embedding || q.embedding.length === 0) {
      return {
        question: q.question,
        embedding: generateMockEmbedding(q.question),
        topicTag: q.topicTag
      };
    }
    return q;
  });
  const mockResults = mockRankSimilarQuestions(
    savedQuestion.embedding,
    previousWithEmbs
  );
  similarResponse = { data: { results: mockResults } };
}



console.log("SIMILAR RESPONSE");

console.log(similarResponse.data);





const similarQuestions=
similarResponse.data.results || [];





await Question.findByIdAndUpdate(

savedQuestion._id,

{

similarQuestions:

similarQuestions.map(

q=>q.question

)

}

);






const updatedQuestion=

await Question.findById(

savedQuestion._id

);





res.status(201).json({


success:true,


message:"Question Saved",


topicTag,


confidence,


similarQuestions,


data:updatedQuestion


});


}


catch(error){

console.log(error);

res.status(500).json({

message:error.message

});

}

});

/* =========================
   QUESTION HISTORY
========================= */

/* =========================
QUESTION HISTORY
========================= */

app.get(

"/questions/history",

authMiddleware,

async(req,res)=>{


try{


const questions=await Question.find({

userId:req.user.id

})

.sort({

createdAt:-1

});



res.json({


success:true,


count:questions.length,


data:questions


});


}


catch(error){


res.status(500).json({

message:error.message

});


}


});


/* =========================
   SIMILAR QUESTIONS (AI POWERED)
========================= */

/* =========================
SIMILAR QUESTIONS
========================= */

app.post(
"/questions/similar",
authMiddleware,
async (req,res)=>{

try{

const {questionId}=req.body;


// current question
const target=await Question.findById(questionId);

if(!target){
return res.status(404).json({
message:"Question not found"
});
}


if(!target.embedding || target.embedding.length===0){
target.embedding = generateMockEmbedding(target.question);
await Question.findByIdAndUpdate(questionId, { embedding: target.embedding });
}

// all previous questions
const allQuestions=
await Question.find({

$or:[

{isSeeded:true},

{userId:req.user.id}

],

_id:{

$ne:questionId

}

});


// map and ensure all questions have embeddings
const validQuestions = allQuestions.map(q => {
  if (!q.embedding || q.embedding.length === 0) {
    return {
      _id: q._id,
      question: q.question,
      embedding: generateMockEmbedding(q.question),
      topicTag: q.topicTag
    };
  }
  return q;
});



let similar = [];

try {
const response=await axios.post(

"http://127.0.0.1:8000/similar",

{

embedding:target.embedding,

questions:

validQuestions.map(q=>({

question:q.question,

embedding:q.embedding,

topicTag:q.topicTag,

id:q._id

}))

}

);

similar = response.data.results || [];

} catch(err) {
console.log("AI Similar Error: Service down. Falling back to local mock similarity search.");
similar = mockRankSimilarQuestions(
  target.embedding,
  validQuestions
);
}




// save similar questions into MongoDB
await Question.findByIdAndUpdate(

questionId,

{

similarQuestions:

similar.map(

q=>q.question

)

}

);




res.json({

success:true,

count:similar.length,

data:similar

});


}

catch(error){

console.log(error);

res.status(500).json({

message:error.message

});

}

});

/* =========================
DASHBOARD STATS
========================= */


app.get(

"/dashboard/stats",

authMiddleware,

async(req,res)=>{


try{


const totalQuestions=

await Question.countDocuments({

userId:req.user.id

});



const topics=

await Question.distinct(

"topicTag",

{

userId:req.user.id

}

);



const totalSimilar=

await Question.aggregate([


{

$match:{


userId:new mongoose.Types.ObjectId(

req.user.id

)


}

},

{

$project:{


count:{

$size:"$similarQuestions"

}


}


},

{

$group:{


_id:null,


total:{

$sum:"$count"

}


}


}


]);




res.json({


success:true,


totalQuestions,


topicsFound:topics.length,


similarFound:

totalSimilar[0]?.total || 0


});


}


catch(error){


res.status(500).json({

message:error.message

})


}



});

/* =========================
RECENT QUESTIONS
========================= */

app.get(

"/questions/recent",

authMiddleware,

async(req,res)=>{


try{


const data=

await Question.find({

userId:req.user.id

})

.sort({

createdAt:-1

})

.limit(5);



res.json({


success:true,


data


});


}


catch(error){


res.status(500).json({

message:error.message

});


}


});
/* =========================
   USERS
========================= */
/* =========================
   USERS
========================= */

app.get("/users", async (req, res) => {

try{

const users = await User.find()
.select("-password");

res.json({

success:true,

count:users.length,

data:users

});

}
catch(error){

res.status(500).json({

message:error.message

});

}

});
/* =========================
DASHBOARD PROFILE
========================= */

app.get(

"/dashboard/profile",

authMiddleware,

async(req,res)=>{


try{


const user=await User.findById(

req.user.id

)

.select("-password");



const totalQuestions=

await Question.countDocuments({

userId:req.user.id

});



const topics=

await Question.distinct(

"topicTag",

{

userId:req.user.id

}

);



res.json({


success:true,


user,


stats:{


totalQuestions,


topicsFound:topics.length


}


});


}


catch(error){


res.status(500).json({

message:error.message

});


}


});


/* =========================
SERVER STATUS
========================= */


app.get(

"/health",

(req,res)=>{


res.json({


success:true,


status:"OK",


message:"Server Running",


time:new Date()


});


});



/* =========================
   START SERVER
========================= */
/* =========================
START SERVER
========================= */


const PORT = process.env.PORT || 5000;



app.listen(PORT,()=>{


console.log(

`🚀 Server running on port ${PORT}`

);


});
