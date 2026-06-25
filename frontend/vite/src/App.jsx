import {BrowserRouter,Routes,Route} from "react-router-dom";
import { useEffect } from "react";
import API from "./api/axios";


import Login from "./pages/Login";
import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Profile from "./pages/Profile";

import ProtectedRoute from "./components/ProtectedRoute";



export default function App(){
  useEffect(() => {
    const wakeBackend = async () => {
      try {
        await API.get("/");
      } catch (error) {
        console.warn("Backend wake-up ping failed:", error);
      }
    };

    wakeBackend();
  }, []);


return(


<BrowserRouter>


<Routes>


<Route

path="/"

element={<Login/>}

/>



<Route

path="/register"

element={<Register/>}

/>




<Route


path="/dashboard"


element={


<ProtectedRoute>


<Dashboard/>


</ProtectedRoute>


}


/>



<Route


path="/history"


element={


<ProtectedRoute>


<History/>


</ProtectedRoute>


}


/>




<Route


path="/profile"


element={


<ProtectedRoute>


<Profile/>


</ProtectedRoute>


}


/>



</Routes>



</BrowserRouter>



)


}