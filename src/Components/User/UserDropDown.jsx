import { Link } from "react-router-dom";
import "../../user-drop-down.css";

function UserDropDown({ isOpen }) {
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
         <div className="logout">
            <button id="logoutBtn">Logout</button>
         </div>
      </div>
   ) : null;
}

export default UserDropDown;
