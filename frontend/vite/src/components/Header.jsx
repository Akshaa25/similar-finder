import { FaUserCircle } from "react-icons/fa";

export default function Header() {


    const user =
        JSON.parse(
            localStorage.getItem("user")
        );


    return (

        <div className="header">



            <h1>

                Dashboard

            </h1>



            <div className="user-box">


                <FaUserCircle
                    size={32}
                />


                <div>

                    <h4>

                        {
                            user?.name ||
                            "User"
                        }

                    </h4>



                    <small>

                        {
                            user?.email
                        }

                    </small>


                </div>



            </div>



        </div>

    );


}