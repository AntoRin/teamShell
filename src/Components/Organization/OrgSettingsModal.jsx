import CloseIcon from "@material-ui/icons/Close";
import "../../org-settings-modal.css";

function OrgSettingsModal({ setIsSettingsOpen }) {
   function closeSettingsModal() {
      setIsSettingsOpen(false);
   }

   return (
      <div className="settings-modal-container">
         <div className="org-settings-card">
            <div className="settings-elements-wrapper">
               <div className="org-settings-form">
                  <h2>Basic Settings</h2>
                  <form>
                     <textarea
                        className="org-modal-textfield"
                        type="text"
                        placeholder="Change Description"
                        rows="5"
                        required
                     ></textarea>
                     <br />
                     <button className="form-action-btn bright" type="submit">
                        Change
                     </button>
                  </form>
               </div>
               <h2>Advanced Settings</h2>
               <div className="org-creator-settings">
                  <div className="add-user-setting">
                     <button className="settings-btn" type="button">
                        Add a User
                     </button>
                  </div>
                  <div className="create-project-setting">
                     <button className="settings-btn" type="button">
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
