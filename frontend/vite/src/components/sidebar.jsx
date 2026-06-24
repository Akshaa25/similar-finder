import {
    MdDashboard,
    MdHistory,
    MdLogout,
    MdQuestionAnswer
} from "react-icons/md";

import { FaUserCircle } from "react-icons/fa";

import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar() {

    const navigate = useNavigate();
    const location = useLocation();


    const logout = () => {

    const confirmLogout = window.confirm(

        "Are you sure you want to logout?"

    );


    if(confirmLogout){

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        navigate("/");

    }

};



    const menus = [

        {
            title: "Dashboard",
            icon: <MdDashboard size={22} />,
            path: "/dashboard"
        },

        {
            title: "History",
            icon: <MdHistory size={22} />,
            path: "/history"
        },

        {
            title: "Profile",
            icon: <FaUserCircle size={20} />,
            path: "/profile"
        }

    ];


    return (

        <div className="sidebar">

            <div className="logo">

                <h2>AI Study</h2>

                <span>Assistant</span>

            </div>



            <div className="menu-list">

                {

                    menus.map((menu) => (

                        <div

                            key={menu.title}

                            className={`menu-item ${
                                location.pathname === menu.path
                                    ? "active"
                                    : ""
                            }`}


                            onClick={() => navigate(menu.path)}

                        >


                            {menu.icon}

                            <p>{menu.title}</p>

                        </div>

                    ))

                }


            </div>



            <button

                className="logout-btn"

                onClick={logout}

            >

                <MdLogout />

                Logout

            </button>

        </div>

    );
}