import { useState, useContext } from "react";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import {
FaEnvelope,
FaLock,
FaEye,
FaEyeSlash
} from "react-icons/fa";

export default function Login() {

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

const { login } = useContext(AuthContext);

const navigate = useNavigate();
const [showPassword,setShowPassword]=useState(false);



const handleLogin = async () => {

try {

const res = await API.post("/auth/login", {

email,
password

});


login(res.data);


localStorage.setItem(

"user",

JSON.stringify(
res.data.user
)

);


navigate("/dashboard");

}


catch (err) {


alert(

err.response?.data?.message ||

"Login Failed"

);

}


};



return (

<div className="auth-page">


<div className="auth-overlay">


<div className="container">


<h1 className="title">

AI Study Assistant

</h1>



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

onClick={handleLogin}

>

Login

</button>




<div className="link">


Not Registered?


{" "}


<Link to="/register">

Create Account

</Link>


</div>



</div>


</div>


</div>


);

}