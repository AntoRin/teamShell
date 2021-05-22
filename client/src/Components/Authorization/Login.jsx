import { useState } from "react";
import { useHistory, Link } from "react-router-dom";
import GitHubIcon from "@material-ui/icons/GitHub";
import GTranslateIcon from "@material-ui/icons/GTranslate";
import HomeIcon from "@material-ui/icons/Home";
import StatusBar from "../UtilityComponents/StatusBar";
import CenteredLoader from "../UtilityComponents/CenteredLoader";
import "../../styles/register-login.css";

function Login() {
   const [inputs, setInputs] = useState({
      userId: "",
      password: "",
   });
   const [actionStatus, setActionStatus] = useState({
      info: null,
      type: "success",
   });
   const [isLoading, setIsLoading] = useState(false);

   const history = useHistory();

   function handleChange(event) {
      setInputs({
         ...inputs,
         [event.target.id]: event.target.value,
      });
   }

   async function handleGithubLogin() {
      window.location.pathname = "/auth/login/github";
   }

   async function handleGoogleLogin() {
      window.location.pathname = "/auth/login/google";
   }

   async function handleLogin(event) {
      event.preventDefault();

      setIsLoading(true);

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

      let loginRequest = await fetch("/api/auth/login", postOptions);
      if (loginRequest.type === "opaqueredirect") {
         setIsLoading(false);
         window.location.href = "/user/home";
         return;
      }

      let loginData = await loginRequest.json();
      if (loginData.status === "error")
         setActionStatus({ info: loginData.error, type: "error" });
      setIsLoading(false);
   }

   return (
      <div className="form-container">
         {isLoading && <CenteredLoader color="primary" backdrop={true} />}
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
            <div className="github-login">
               <GitHubIcon onClick={handleGithubLogin} fontSize="large" />
               <GTranslateIcon onClick={handleGoogleLogin} fontSize="large" />
            </div>
         </div>
         <div onClick={() => history.push("/")} className="home-redirect">
            <HomeIcon />
         </div>
         {actionStatus.info && (
            <StatusBar
               actionStatus={actionStatus}
               setActionStatus={setActionStatus}
            />
         )}
      </div>
   );
}

export default Login;
