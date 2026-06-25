import { useEffect, useState } from "react";
import API from "../api/axios";

import Sidebar from "../components/sidebar";
import Header from "../components/Header";

export default function Profile() {

const [user,setUser]=useState(null);


useEffect(()=>{

fetchProfile();

},[]);



const fetchProfile=async()=>{

try{

const res=await API.get("/auth/profile");

setUser(res.data.user);

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


<div className="profile-card">


<div className="avatar">

👤

</div>



<h2>

{user?.name}

</h2>



<p>

{user?.email}

</p>



<div className="profile-info">


<div>

<h4>

Joined

</h4>


<p>

{

user?.createdAt ?

new Date(user.createdAt)

.toLocaleDateString()

:

"-"

}

</p>

</div>



</div>


</div>



</div>


</div>


)

}