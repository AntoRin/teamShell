import { useState } from "react";
import { useHistory, Link } from "react-router-dom";
import GitHubIcon from "@material-ui/icons/GitHub";
import HomeIcon from "@material-ui/icons/Home";
import StatusBar from "../UtilityComponents/StatusBar";
import "../../styles/register-login.css";

function Login() {
   const [inputs, setInputs] = useState({
      userId: "",
      password: "",
   });
   const [actionStatus, setActionStatus] = useState(null);

   const history = useHistory();

   function handleChange(event) {
      setInputs({
         ...inputs,
         [event.target.id]: event.target.value,
      });
   }

   async function handleGithubLogin() {
      let loginResponse = await fetch("/auth/login/github", {
         redirect: "follow",
      });

      if (loginResponse.type === "opaqueredirect")
         window.location.href = loginResponse.url;
      else {
         let loginStatus = await loginResponse.json();
         console.log(loginStatus);
      }
   }

   async function handleLogin(event) {
      event.preventDefault();

      let body = {
         Email: inputs.userId,
         Password: inputs.password,
      };

      let postOptions = {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(body),
         redirect: "manual",
         credentials: "include",
      };

      let loginRequest = await fetch("/auth/login", postOptions);
      if (loginRequest.type === "opaqueredirect") {
         window.location.href = "/user/home";
         return;
      }

      let loginData = await loginRequest.json();
      if (loginData.status === "error") setActionStatus(loginData.error);
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
                        required
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
                        required
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
               </div>
            </form>
            <div onClick={handleGithubLogin} className="github-login">
               <GitHubIcon fontSize="large" />
            </div>
         </div>
         <div onClick={() => history.push("/")} className="home-redirect">
            <HomeIcon />
         </div>
         {actionStatus && (
            <StatusBar
               actionStatus={actionStatus}
               setActionStatus={setActionStatus}
               statusType="error"
            />
         )}
      </div>
   );
}

export default Login;
