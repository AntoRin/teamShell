import { useHistory, Link } from "react-router-dom";
import "../../landing-nav.css";

function LandingNav() {
   const history = useHistory();

   return (
      <div className="nav-landing-container">
         <div className="nav-landing">
            <div className="nav-left">
               <Link to="/">LOGO</Link>
            </div>
            <div className="nav-right">
               <ul>
                  <li>
                     <button
                        id="ladningNavBtn"
                        onClick={() => history.push("/login")}
                     >
                        LOGIN
                     </button>
                  </li>
                  <li>
                     <button
                        id="ladningNavBtn"
                        onClick={() => history.push("/about")}
                     >
                        ABOUT
                     </button>
                  </li>
               </ul>
            </div>
         </div>
      </div>
   );
}

export default LandingNav;
