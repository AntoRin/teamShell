import { useState } from "react";
import CloseIcon from "@material-ui/icons/Close";
import "../../styles/settings-modal.css";

function ProjectSettingsModal({ setSettings }) {
   const [newDescription, setNewDescription] = useState("");
   const [addUserQuery, setAddUserQuery] = useState(false);
   const [newUser, setNewUser] = useState("");

   function updateProjectSettings(event) {
      event.preventDefault();
   }

   function handleDescriptionChange(event) {
      setNewDescription(event.target.value);
   }

   function showAddUserQuery() {
      setAddUserQuery(prev => !prev);
   }

   function handleNewUserNameChange(event) {
      setNewUser(event.target.value);
   }

   function addUserToProject(event) {
      event.preventDefault();
   }

   function closeSettingsModal() {
      setSettings(false);
   }

   return (
      <div className="settings-modal-container">
         <div className="settings-modal-card">
            <div className="settings-elements-wrapper">
               <div className="project-settings-form">
                  <h2>Basic Settings</h2>
                  <form onSubmit={updateProjectSettings}>
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
                        <form
                           id="addUserToProjectForm"
                           onSubmit={addUserToProject}
                        >
                           <input
                              onChange={handleNewUserNameChange}
                              value={newUser}
                              type="text"
                              placeholder="Unique Username of the User"
                              id="addUserInput_ProjectModal"
                              required
                           />
                           <button className="form-action-btn" type="submit">
                              Add User
                           </button>
                        </form>
                     </div>
                  )}
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

export default ProjectSettingsModal;
