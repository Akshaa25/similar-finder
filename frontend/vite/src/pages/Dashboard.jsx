import { useEffect, useState } from "react";
import API from "../api/axios";
import Sidebar from "../components/sidebar";
import Header from "../components/Header";
import { toast } from "react-toastify";
import StatsCard from "../components/StatsCard";

export default function Dashboard() {

const [question,setQuestion]=useState("");

const [topic,setTopic]=useState("");

const [confidence,setConfidence]=useState("");

// showSimilar: true after ANY submission so we always display the panel
const [showSimilar,setShowSimilar]=useState(false);

const [similar,setSimilar]=useState([]);
const [loading,setLoading] = useState(false);
const [submittedQuestion,setSubmittedQuestion] = useState("");



const [stats,setStats]=useState({

totalQuestions:0,
topicsFound:0,
similarFound:0

});


useEffect(()=>{

loadStats();


},[]);



const loadStats=async()=>{

try{

const res=await API.get(

"/dashboard/stats"

);

setStats(res.data);

}

catch(err){

console.log(err);

}

};







const askQuestion=async()=>{

console.log("BUTTON CLICKED");


if(!question.trim()){

alert("Enter Question");

return;

}




    try{

setLoading(true);


const res=await API.post(

"/questions/ask",

{

question

}

);



console.log("BACKEND RESPONSE");
console.log(res.data);

console.log("SIMILAR");
console.log(res.data.similarQuestions);



setTopic(

res.data.topicTag

);



setConfidence(

res.data.confidence

);



// Normalise: API can return objects {question,topicTag,score} or plain strings
const rawSimilar = res.data.similarQuestions || [];
const similarData = rawSimilar.map(item =>
  typeof item === "string"
    ? { question: item, topicTag: "", score: null }
    : item
);

setSubmittedQuestion(question.trim());
setSimilar(similarData);
// Always show the panel after every submission
setShowSimilar(true);

setQuestion("");

await loadStats();

setLoading(false);

toast.success("Question Saved Successfully");



}
catch(err){

console.log(err);

setLoading(false);

}



}

return(

<div className="dashboard-layout">


<Sidebar/>


<div className="dashboard-main">


<Header/>


<div className="dashboard-content">



<div className="stats-grid">


<StatsCard

title="Questions"

value={stats.totalQuestions}

/>



<StatsCard

title="Topics"

value={stats.topicsFound}

/>



<StatsCard

title="Similar"

value={stats.similarFound}

/>


</div>





<div className="ask-card">


<h2>

Ask a Question

</h2>



<textarea


className="question-area"


placeholder="Type your study question..."


value={question}


onChange={(e)=>

setQuestion(

e.target.value

)

}


/>


<button
className="submit-btn"
onClick={askQuestion}
disabled={loading}
>

{
loading
?
"Submitting..."
:
"Submit"
}

</button>



</div>






{


topic && (


<div className="topic-card">


<h3>

Detected Topic

</h3>



<span className={`topic-badge ${topic}`}>

{topic}

</span>


<small>

Confidence :

{


Number(

confidence

).toFixed(2)

}


</small>



</div>


)

}











{
showSimilar && (

<div className="similar-card">

  <div className="similar-header">
    <h3>🔍 Similar Questions</h3>
    {submittedQuestion && (
      <span className="similar-query">
        for: "{submittedQuestion.length > 55
          ? submittedQuestion.slice(0, 55) + "..."
          : submittedQuestion}"
      </span>
    )}
  </div>

  {
    similar.length === 0 ? (
      <div className="no-similar">
        <span className="no-similar-icon">🎯</span>
        <p>No similar questions found yet.</p>
        <small>Keep asking — your knowledge graph will grow!</small>
      </div>
    ) : (
      similar.map((item, index) => (
        <div key={index} className="similar-item">

          <div className="similar-item-top">
            <h4>💡 {item.question}</h4>
            {item.topicTag && (
              <span className={`topic-badge ${item.topicTag}`}>
                {item.topicTag}
              </span>
            )}
          </div>

          {item.score !== null && item.score !== undefined && (
            <>
              <p className="similar-score">
                Similarity: <strong>{Math.round(item.score * 100)}%</strong>
              </p>
              <div className="progress">
                <div
                  className="progress-fill"
                  style={{ width: `${Math.min(item.score * 100, 100)}%` }}
                />
              </div>
            </>
          )}

        </div>
      ))
    )
  }

</div>

)
}









</div>


</div>


</div>

);

}
