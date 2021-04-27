import { useState } from "react";
import { useHistory } from "react-router-dom";
import CloseIcon from "@material-ui/icons/Close";
import "../../styles/settings-modal.css";

function OrgSettingsModal({ User, match, Organization, setIsSettingsOpen }) {
   const [newDescription, setNewDescription] = useState("");
   const [newUser, setNewUser] = useState("");
   const [addUserQuery, setAddUserQuery] = useState(false);

   const history = useHistory();

   function closeSettingsModal() {
      setIsSettingsOpen(false);
   }

   function handleDescriptionChange(event) {
      setNewDescription(event.target.value);
   }

   function handleNewUserNameChange(event) {
      setNewUser(event.target.value);
   }

   function showAddUserQuery() {
      setAddUserQuery(prev => !prev);
   }

   async function updateOrgSettings(event) {
      event.preventDefault();

      let body = {
         Org: Organization.OrganizationName,
         Description: newDescription,
      };

      let postOptions = {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(body),
         credentials: "include",
      };

      let updateRequest = await fetch(
         "http://localhost:5000/organization/edit",
         postOptions
      );
      let updateResponse = await updateRequest.json();
      if (updateResponse.status === "ok") window.location.reload();
   }

   async function addUserToOrg(event) {
      event.preventDefault();
      if (Organization.Members.includes(newUser))
         return console.log("User already present");

      let body = {
         initiator: {
            UniqueUsername: User.UniqueUsername,
            ProfileImage: User.ProfileImage,
         },
         recipient: newUser,
         metaData: {
            type: "Invitation",
            invitation_category: "Organization",
            invitation_dest: Organization.OrganizationName,
         },
      };

      let postOptions = {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(body),
         credentials: "include",
      };

      let newUserRequest = await fetch(
         "http://localhost:5000/profile/notifications",
         postOptions
      );
      let newUserResponse = await newUserRequest.json();
      if (newUserResponse.status === "ok") window.location.reload();
   }

   function createProjectRedirect() {
      let projectUrl = `/create/project?Organization=${match.params.OrganizationName}`;
      history.push(projectUrl);
   }

   return (
      <div className="settings-modal-container">
         <div className="settings-modal-card">
            <div className="settings-elements-wrapper">
               <div className="org-settings-form">
                  <h2>Basic Settings</h2>
                  <form onSubmit={updateOrgSettings}>
                     <textarea
                        onChange={handleDescriptionChange}
                        value={newDescription}
                        className="settings-modal-textfield"
                        type="text"
                        placeholder="Change Description"
                        rows="5"
                        required
                     ></textarea>
                     <br />
                     <button className="form-action-btn bright" type="submit">
                        Update
                     </button>
                  </form>
               </div>
               <h2>Advanced Settings</h2>
               <div className="advanced-creator-settings">
                  <div className="add-user-setting">
                     <button
                        onClick={showAddUserQuery}
                        className="settings-btn"
                        type="button"
                     >
                        Add a User
                     </button>
                  </div>
                  {addUserQuery && (
                     <div className="add-user-query">
                        <form id="addUserToOrgForm" onSubmit={addUserToOrg}>
                           <input
                              onChange={handleNewUserNameChange}
                              value={newUser}
                              type="text"
                              placeholder="Unique Username of the User"
                              id="addUserInput_OrgModal"
                              required
                           />
                           <button className="form-action-btn" type="submit">
                              Add User
                           </button>
                        </form>
                     </div>
                  )}
                  <div className="create-project-setting">
                     <button
                        onClick={createProjectRedirect}
                        className="settings-btn"
                        type="button"
                     >
                        Create a Project
                     </button>
                  </div>
               </div>
            </div>
         </div>
         <CloseIcon
            fontSize="large"
            onClick={closeSettingsModal}
            className="modal-close-btn"
         />
      </div>
   );
}

export default OrgSettingsModal;
