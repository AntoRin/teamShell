import { useState } from "react";
import { useHistory, Link } from "react-router-dom";
import GitHubIcon from "@material-ui/icons/GitHub";
import HomeIcon from "@material-ui/icons/Home";
import "../../register-login.css";

function Login() {
   const [inputs, setInputs] = useState({
      userId: "",
      password: "",
   });

   const history = useHistory();

   function handleChange(event) {
      setInputs({
         ...inputs,
         [event.target.id]: event.target.value,
      });
   }

   //------------Change URL of server-----------------

   async function handleGithubLogin() {
      let loginRequest = await fetch(
         "http://localhost:5000/auth/login/github",
         {
            redirect: "manual",
         }
      );

      if (loginRequest.type === "opaqueredirect")
         window.location.href = loginRequest.url;
      else {
         let loginStatus = await loginRequest.json();
         console.log(loginStatus);
      }
   }

   function handleLogin(event) {
      event.preventDefault();
   }

   return (
      <div className="form-container">
         <div className="form-card">
            <form onSubmit={handleLogin} id="userDetailsForm">
               <div className="form-elements">
                  <header className="form-header">Login</header>
                  <div className="email-field">
                     <input
                        onChange={handleChange}
                        value={inputs.userId}
                        placeholder="Email"
                        type="text"
                        id="userId"
                     />
                  </div>
                  <div className="password-field">
                     <input
                        onChange={handleChange}
                        value={inputs.password}
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
                        <p>Not registered?</p>
                     </span>
                     <span>
                        <Link to="/register">Register</Link>
                     </span>
                  </div>
                  <div onClick={handleGithubLogin} className="github-login">
                     <GitHubIcon fontSize="large" />
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

export default Login;
