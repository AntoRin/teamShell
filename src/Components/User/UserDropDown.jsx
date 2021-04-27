import { Link, useHistory } from "react-router-dom";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import "../../styles/user-drop-down.css";

function UserDropDown({ isOpen, setIsDropdownOpen, UniqueUsername }) {
   const history = useHistory();
   //----------------------Change logout endpoint & credentials----------------------------

   function closeDropdown() {
      setIsDropdownOpen(false);
   }

   async function handleLogout() {
      let logout = await fetch("http://localhost:5000/auth/logout", {
         redirect: "manual",
         credentials: "include",
      });
      if (logout.type === "opaqueredirect") history.push("/");
   }

   return isOpen ? (
      <ClickAwayListener onClickAway={closeDropdown}>
         <div className="drop-down-container">
            <div className="option-profile">
               <Link
                  className="drop-down-link"
                  to={`/user/profile/${UniqueUsername}`}
               >
                  Profile
               </Link>
            </div>
            <div className="option-organizations">
               <Link className="drop-down-link" to="/user/organizations">
                  Organizations
               </Link>
            </div>
            <div className="option-projects">
               <Link className="drop-down-link" to="/user/projects">
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
      </ClickAwayListener>
   ) : null;
}

export default UserDropDown;
