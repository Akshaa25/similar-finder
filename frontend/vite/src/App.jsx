import {BrowserRouter,Routes,Route} from "react-router-dom";


import Login from "./pages/Login";
import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Profile from "./pages/Profile";

import ProtectedRoute from "./components/ProtectedRoute";



export default function App(){


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