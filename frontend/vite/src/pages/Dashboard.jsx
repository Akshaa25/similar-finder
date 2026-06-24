import { useEffect, useState } from "react";
import API from "../api/axios";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { toast } from "react-toastify";
import StatsCard from "../components/StatsCard";

export default function Dashboard() {

const [question,setQuestion]=useState("");

const [topic,setTopic]=useState("");

const [confidence,setConfidence]=useState("");

const [showSimilar,setShowSimilar]=useState(false);

const [similar,setSimilar]=useState([]);
const [loading,setLoading] = useState(false);



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



const similarData=

res.data.similarQuestions || [];


setSimilar(

similarData

);


setShowSimilar(

similarData.length>0

);



setQuestion("");


await loadStats();

setLoading(false);

toast.success(
"Question Saved Successfully"
);



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

<h3>
Similar Questions
</h3>

{

similar.length===0 ?

(

<p>No Similar Questions Found</p>

)

:

(

similar.map((item,index)=>(

<div
key={index}
className="similar-item"
>

<h4>
💡 {item.question}
</h4>

<p>
🏷️ {item.topicTag}
</p>

<p>

Similarity :

{Math.round(item.score*100)}%

</p>

<div className="progress">

<div

className="progress-fill"

style={{

width:`${item.score*100}%`

}}

>

</div>

</div>

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
