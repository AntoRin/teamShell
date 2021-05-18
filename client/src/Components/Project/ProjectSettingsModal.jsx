import { useState } from "react";
import CloseIcon from "@material-ui/icons/Close";
import inititateNewNotification from "../../utils/notificationService";
import StatusBar from "../UtilityComponents/StatusBar";
// import "../../styles/settings-modal.css";

function ProjectSettingsModal({ User, Project, setSettings }) {
   const [newDescription, setNewDescription] = useState("");
   const [addUserQuery, setAddUserQuery] = useState(false);
   const [newUser, setNewUser] = useState("");
   const [actionStatus, setActionStatus] = useState({
      info: null,
      type: "success",
   });

   function handleDescriptionChange(event) {
      setNewDescription(event.target.value);
   }

   function handleNewUserNameChange(event) {
      setNewUser(event.target.value);
   }

   function showAddUserQuery() {
      setAddUserQuery(prev => !prev);
   }

   async function updateProjectSettings(event) {
      event.preventDefault();

      let body = {
         ProjectName: Project.ProjectName,
         ProjectDescription: newDescription,
      };

      let postOptions = {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(body),
         credentials: "include",
      };

      let update = await fetch("/project/edit", postOptions);
      let updateResponse = await update.json();

      if (updateResponse.status === "ok") window.location.reload();
   }

   async function addUserToProject(event) {
      event.preventDefault();

      if (Project.Members.includes(newUser))
         return console.log("User already present");

      let invitationData = {
         initiator: {
            UniqueUsername: User.UniqueUsername,
            ProfileImage: User.ProfileImage,
         },
         recipient: newUser,
         metaData: {
            notification_type: "User",
            info_type: "Invitation",
            target_category: "Project",
            target_name: Project.ProjectName,
            target_info: `Project with ${Project.Members.length} member(s)`,
            initiator_opinion: "invited",
         },
      };

      let invitationResponse = await inititateNewNotification(invitationData);

      if (invitationResponse.status === "ok")
         setActionStatus({ info: "Invitation sent to user", type: "success" });
      if (invitationResponse.status === "error")
         setActionStatus({ info: invitationResponse.error, type: "error" });
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
         {actionStatus.info && (
            <StatusBar
               actionStatus={actionStatus}
               setActionStatus={setActionStatus}
            />
         )}
      </div>
   );
}

export default ProjectSettingsModal;
