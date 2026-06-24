import { useState } from "react";
import API from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import {
FaUser,
FaEnvelope,
FaLock,
FaEye,
FaEyeSlash
} from "react-icons/fa";

export default function Register() {


const [name, setName] = useState("");

const [email, setEmail] = useState("");

const [password, setPassword] = useState("");


const navigate = useNavigate();
const [showPassword,setShowPassword]=useState(false);




const handleRegister = async () => {


try {


const res = await API.post(

"/auth/signup",

{

name,
email,
password

}

);



alert(

res.data.message

);


navigate("/");


}


catch (err) {


alert(

err.response?.data?.message ||

"Registration Failed"

);

}


};




return (


<div className="auth-page">


<div className="auth-overlay">


<div className="container">


<h1 className="title">

Create Account

</h1>



<div className="input-group">

<FaUser className="input-icon"/>

<input

className="input"

type="text"

placeholder="Enter Name"

value={name}

onChange={(e)=>setName(e.target.value)}

/>

</div>



<div className="input-group">

<FaEnvelope className="input-icon"/>

<input

className="input"

type="email"

placeholder="Enter Email"

value={email}

onChange={(e)=>setEmail(e.target.value)}

/>

</div>




<div className="input-group">


<FaLock className="input-icon"/>



<input

className="input"

type={showPassword ? "text":"password"}

placeholder="Enter Password"

value={password}

onChange={(e)=>setPassword(e.target.value)}

/>



<div

className="eye-icon"

onClick={()=>setShowPassword(!showPassword)}
>

{
showPassword ?

<FaEyeSlash/>

:

<FaEye/>
}

</div>


</div>



<button

className="btn"

onClick={handleRegister}

>

Register

</button>




<div className="link">


Already have an account?


{" "}


<Link to="/">

Login Here

</Link>


</div>



</div>


</div>


</div>


);

}