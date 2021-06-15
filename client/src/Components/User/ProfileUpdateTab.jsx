import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";

function ProfileUpdateTab({
   fileInputElement,
   handleImageUpload,
   handleProfileUpdate,
   bioElement,
   usernameElement,
   handleCancelUpdate,
}) {
   return (
      <div className="profile-edit-section">
         <form
            id="profileImageUploadForm"
            encType="multipart/form-data"
            onSubmit={handleImageUpload}
         >
            <div className="upload-image">
               <Typography variant="h5">Upload a new profile image</Typography>
               <input
                  ref={fileInputElement}
                  type="file"
                  id="profileImage"
                  required
               />
               <Button variant="outlined" type="submit" color="primary">
                  Upload
               </Button>
            </div>
         </form>
         <form id="profileEditForm" onSubmit={handleProfileUpdate}>
            <div className="edit-bio">
               <label htmlFor="bioEdit">Add a bio</label> <br />
               <textarea
                  ref={bioElement}
                  autoComplete="off"
                  id="bioEdit"
                  maxLength="300"
                  rows="7"
                  required
               ></textarea>
            </div>
            <div className="edit-name">
               <label htmlFor="nameEdit">Username</label> <br />
               <input
                  ref={usernameElement}
                  autoComplete="off"
                  type="text"
                  id="nameEdit"
                  required
               />
            </div>
            <div className="submit-edition">
               <button
                  type="button"
                  className="form-action-btn dull"
                  id="cancelEditsBtn"
                  onClick={handleCancelUpdate}
               >
                  Cancel
               </button>
               <button
                  className="form-action-btn bright"
                  id="saveEditsBtn"
                  type="submit"
               >
                  Save
               </button>
            </div>
         </form>
      </div>
   );
}

export default ProfileUpdateTab;
