import { Link, useHistory } from "react-router-dom";
import "../../user-drop-down.css";

function UserDropDown({ isOpen }) {
   const history = useHistory();
   //----------------------Change logout endpoint & credentials----------------------------

   async function handleLogout() {
      let logout = await fetch("http://localhost:5000/auth/logout", {
         redirect: "manual",
         credentials: "include",
      });
      if (logout.type === "opaqueredirect") history.push("/");
   }

   return isOpen ? (
      <div className="drop-down-container">
         <div className="option-profile">
            <Link className="drop-down-link" to="/user/profile">
               Profile
            </Link>
         </div>
         <div className="option-organizations">
            <Link className="drop-down-link" to="/user/profile">
               Organizations
            </Link>
         </div>
         <div className="option-projects">
            <Link className="drop-down-link" to="/user/profile">
               Projects
            </Link>
         </div>
         <div className="option-projects">
            <Link className="drop-down-link" to="/user/settings">
               Settings
            </Link>
         </div>
         <div className="logout">
            <button onClick={handleLogout} id="logoutBtn">
               Logout
            </button>
         </div>
      </div>
   ) : null;
}

export default UserDropDown;
