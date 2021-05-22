import { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import ListItemText from "@material-ui/core/ListItemText";
import ListItem from "@material-ui/core/ListItem";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import SaveAltIcon from "@material-ui/icons/SaveAlt";
import AddToPhotosIcon from "@material-ui/icons/AddToPhotos";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import { Button, TextField } from "@material-ui/core";
import FullScreenDialog from "../UtilityComponents/FullScreenDialog";
import StatusBar from "../UtilityComponents/StatusBar";
import "../../styles/settings-modal.css";

const useStyles = makeStyles(theme => ({
   listHeader: {
      backgroundColor: "whitesmoke",
      cursor: "default",
      boxShadow: "0px 1px 2px black",
   },
   submitBtn: {},
}));

function ProjectSettingsModal({ User, Project, setIsSettingsOpen }) {
   const classes = useStyles();

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

      let update = await fetch("/api/project/edit", postOptions);
      let updateResponse = await update.json();

      if (updateResponse.status === "ok") window.location.reload();
   }

   async function addUserToProject(event) {
      event.preventDefault();

      if (Project.Members.includes(newUser)) {
         setActionStatus({ info: "User already present", type: "info" });
         return;
      }

      let invitationData = {
         initiator: {
            UniqueUsername: User.UniqueUsername,
            ProfileImage: User.ProfileImage,
         },
         recipient: newUser,
         metaData: {
            notification_type: "Invitation",
            target_category: "Project",
            target_name: Project.ProjectName,
            target_info: `Project with ${Project.Members.length} member(s)`,
         },
      };

      let postOptions = {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(invitationData),
         credentials: "include",
      };

      let invitationStream = await fetch(
         "/api/project/invite/new-user",
         postOptions
      );

      let invitationResponse = await invitationStream.json();

      if (invitationResponse.status === "ok") {
         setActionStatus({ info: "Invitation sent to user", type: "success" });
         return;
      }
      if (invitationResponse.status === "error") {
         setActionStatus({ info: "User not found", type: "error" });
         return;
      }
   }

   return (
      <div>
         <FullScreenDialog
            actionStatus={actionStatus}
            setActionStatus={setActionStatus}
            setIsSettingsOpen={setIsSettingsOpen}
         >
            <List>
               <ListItem className={classes.listHeader} button>
                  <ListItemText primary="Basic Settings" />
               </ListItem>
               <Divider />
               <ListItem>
                  <div className="basic-settings-wrapper">
                     <form onSubmit={updateProjectSettings}>
                        <div>
                           <TextField
                              onChange={handleDescriptionChange}
                              value={newDescription}
                              rows="5"
                              multiline
                              variant="filled"
                              label="Change Description"
                              color="primary"
                              fullWidth
                              required
                           />
                        </div>
                        <br />

                        <Button
                           type="submit"
                           variant="outlined"
                           color="secondary"
                           fullWidth
                           endIcon={<SaveAltIcon />}
                           size="large"
                        >
                           Update Basic Settings
                        </Button>
                     </form>
                  </div>
               </ListItem>
               <br />
               <br />
               <ListItem className={classes.listHeader} button>
                  <ListItemText primary="Advanced Settings" />
               </ListItem>
               <Divider />
               <ListItem>
                  <Button
                     onClick={showAddUserQuery}
                     size="large"
                     endIcon={
                        addUserQuery ? <ExpandLessIcon /> : <ExpandMoreIcon />
                     }
                  >
                     Add a new user to your project
                  </Button>
               </ListItem>
               {addUserQuery && (
                  <ListItem>
                     <form
                        id="addUserToProjectForm"
                        onSubmit={addUserToProject}
                     >
                        <TextField
                           onChange={handleNewUserNameChange}
                           value={newUser}
                           type="text"
                           label="Unique Username of the User"
                           fullWidth
                           margin="normal"
                           variant="filled"
                           autoComplete="off"
                           id="addUserInput_ProjectModal"
                           required
                        />
                        <Button
                           variant="outlined"
                           color="secondary"
                           fullWidth
                           type="submit"
                           endIcon={<AddToPhotosIcon />}
                           size="large"
                        >
                           Add
                        </Button>
                     </form>
                  </ListItem>
               )}
               <Divider />
            </List>
            {actionStatus.info && (
               <StatusBar
                  actionStatus={actionStatus}
                  setActionStatus={setActionStatus}
               />
            )}
         </FullScreenDialog>
      </div>
   );
}

export default ProjectSettingsModal;
