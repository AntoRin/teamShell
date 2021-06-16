import { useState, useContext } from "react";
import { useHistory, Link } from "react-router-dom";
import HomeIcon from "@material-ui/icons/Home";
import { GlobalActionStatus } from "../App";
import "../../styles/register-login.css";

function Register() {
   const [inputs, setInputs] = useState({
      uniqueUsername: "",
      username: "",
      email: "",
      password: "",
   });

   const setActionStatus = useContext(GlobalActionStatus);

   const history = useHistory();

   function handleChange(event) {
      setInputs({
         ...inputs,
         [event.target.id]: event.target.value,
      });
   }

   async function handleRegister(event) {
      event.preventDefault();

      try {
         let body = {
            UniqueUsername: inputs.uniqueUsername,
            Username: inputs.username,
            Email: inputs.email,
            Password: inputs.password,
         };

         let postOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
         };

         let registerDataStream = await fetch(
            "/api/auth/register",
            postOptions
         );
         let registerResponse = await registerDataStream.json();

         if (registerResponse.status === "error") throw registerResponse.error;

         if (registerResponse.status === "ok") history.push("/login");
      } catch (error) {
         console.log(error);
         setActionStatus({ info: error, type: "error" });
      }
   }

   return (
      <div className="form-container">
         <div className="form-card">
            <form onSubmit={handleRegister} id="userDetailsForm">
               <div className="form-elements">
                  <header className="form-header">Register</header>
                  <div className="unique-field">
                     <input
                        required
                        value={inputs.uniqueName}
                        onChange={handleChange}
                        placeholder="Unique Username"
                        autoComplete="off"
                        type="text"
                        id="uniqueUsername"
                        pattern="^[a-zA-Z0-9_-]*$"
                     />
                  </div>
                  <div className="name-field">
                     <input
                        required
                        value={inputs.name}
                        onChange={handleChange}
                        placeholder="Name"
                        autoComplete="off"
                        type="text"
                        id="username"
                     />
                  </div>
                  <div className="email-field">
                     <input
                        required
                        value={inputs.email}
                        onChange={handleChange}
                        placeholder="Email"
                        type="email"
                        id="email"
                     />
                  </div>
                  <div className="password-field">
                     <input
                        required
                        value={inputs.password}
                        onChange={handleChange}
                        placeholder="Password"
                        autoComplete="off"
                        type="password"
                        id="password"
                     />
                  </div>
                  <div className="form-submit">
                     <button id="submitBtn" type="submit">
                        Continue
                     </button>
                  </div>
                  <div className="entry-redirect">
                     <span>
                        <p>Already a user?</p>
                     </span>
                     <span>
                        <Link to="/login">Login</Link>
                     </span>
                  </div>
               </div>
            </form>
         </div>
         <div onClick={() => history.push("/")} className="home-redirect">
            <HomeIcon />
         </div>
      </div>
   );
}

export default Register;
