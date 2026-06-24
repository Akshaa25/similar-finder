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

.then(()=>{

console.log("✅ MongoDB Connected");

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

"What is React?",
"Explain React components.",
"What is JSX?",
"How does useState work?",
"What is useEffect?",

"What is JavaScript?",
"Explain closures in JavaScript.",
"What is hoisting?",
"What are promises?",
"What is async await?",

"What is Python?",
"Explain Python lists.",
"What is inheritance in Python?",
"What is polymorphism?",
"What are decorators?",

"What is Java?",
"What is encapsulation?",
"What is inheritance in Java?",
"What is JVM?",
"What is Spring Boot?",

"What is MongoDB?",
"What are collections?",
"What are documents?",
"What is indexing?",
"What is aggregation?",

"What is NodeJS?",
"Explain Event Loop.",
"What is npm?",
"What are modules?",
"What is ExpressJS?",

"What is middleware?",
"What is routing in Express?",
"What is REST API?",
"How to handle errors in Express?",
"What is JWT?",

"What is OOP?",
"What is SQL?",
"What is normalization?",
"What is recursion?",
"What is binary search?",

"What is a linked list?",
"What is stack?",
"What is queue?",
"What is tree data structure?",
"What is graph data structure?",

"What is machine learning?",
"What is deep learning?",
"What is supervised learning?",
"What is unsupervised learning?",
"What is neural network?"

];


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

function getTopicTag(question) {

const q = question.toLowerCase();

if(q.includes("react")) return "React";

if(q.includes("node") || q.includes("nodejs"))
return "NodeJS";

if(q.includes("express"))
return "ExpressJS";

if(q.includes("mongo"))
return "MongoDB";

if(q.includes("python"))
return "Python";

if(q.includes("java"))
return "Java";

if(q.includes("javascript") || q.includes("js"))
return "JavaScript";

return "General";

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

try{

aiResponse=await axios.post(

"http://127.0.0.1:8000/analyze",

{question}

);

}
catch(err){

console.log("AI Error",err.message);

}




const topicTag=
aiResponse?.data?.topicTag || "General";


const embedding=
aiResponse?.data?.embedding || [];


const confidence=
aiResponse?.data?.confidence || 0;





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

const similarResponse=await axios.post(

"http://127.0.0.1:8000/similar",

{

embedding:savedQuestion.embedding,


questions:

previousQuestions

.filter(q=>q.embedding.length>0)

.map(q=>({

question:q.question,

embedding:q.embedding,

topicTag:q.topicTag

}))


}

);



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


if(target.embedding.length===0){

return res.json({

success:true,

count:0,

data:[]

});

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


// only keep questions that have embeddings
const validQuestions=

allQuestions.filter(

q=>q.embedding.length>0

);



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




const similar=

response.data.results || [];




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
