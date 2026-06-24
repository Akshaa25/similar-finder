import {useEffect,useState} from "react";

import API from "../api/axios";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";


export default function History(){


const[data,setData]=useState([]);



useEffect(()=>{

fetchHistory();

},[]);



const fetchHistory=async()=>{


try{


const res=await API.get(

"/questions/history"

);



setData(

res.data.data

);


}


catch(err){

console.log(err);

}


};



return(



<div className="dashboard-layout">



<Sidebar/>


<div className="dashboard-main">



<Header/>


<div className="history-card">



<h2>

Question History

</h2>



<table>


<thead>


<tr>

<th>

Question

</th>


<th>

Topic

</th>



<th>

Date

</th>


</tr>



</thead>




<tbody>



{

data.map((q)=>(


<tr key={q._id}>


<td>

{q.question}

</td>



<td>

{q.topicTag}

</td>



<td>

{

new Date(

q.createdAt

)

.toLocaleDateString()

}


</td>



</tr>


))


}



</tbody>



</table>




</div>



</div>


</div>



)


}