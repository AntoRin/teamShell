import { useState, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import ListItemText from "@material-ui/core/ListItemText";
import ListItem from "@material-ui/core/ListItem";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import SaveAltIcon from "@material-ui/icons/SaveAlt";
import AddToPhotosIcon from "@material-ui/icons/AddToPhotos";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import { Button, Switch, TextField, Typography } from "@material-ui/core";
import { GlobalActionStatus } from "../App";
import FullScreenDialog from "../UtilityComponents/FullScreenDialog";
import "../../styles/settings-modal.css";

const useStyles = makeStyles(theme => ({
   listHeader: {
      backgroundColor: "whitesmoke",
      cursor: "default",
      boxShadow: "0px 1px 2px black",
   },
   optionPair: {
      display: "flex",
      justifyContent: "flex-start",
      alignItems: "flex-end",
   },
}));

function ProjectSettingsModal({
   User,
   Project,
   isSettingsOpen,
   setIsSettingsOpen,
}) {
   const classes = useStyles();

   const [newDescription, setNewDescription] = useState(
      Project.ProjectDescription
   );
   const [inviteOnly, setInviteOnly] = useState(Boolean(Project.InviteOnly));
   const [addUserQuery, setAddUserQuery] = useState(false);
   const [newUser, setNewUser] = useState("");

   const setActionStatus = useContext(GlobalActionStatus);

   function handleDescriptionChange(event) {
      setNewDescription(event.target.value);
   }

   function handleSwitchChange(event) {
      setInviteOnly(event.target.checked);
   }

   function handleNewUserNameChange(event) {
      setNewUser(event.target.value);
   }

   function showAddUserQuery() {
      setAddUserQuery(prev => !prev);
   }

   async function updateProjectSettings(event) {
      event.preventDefault();

      try {
         let body = {
            ProjectName: Project.ProjectName,
            ProjectDescription: newDescription,
            InviteOnly: inviteOnly,
         };

         let postOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
         };

         let update = await fetch("/api/project/edit", postOptions);
         let updateResponse = await update.json();

         if (updateResponse.status === "ok") {
            setActionStatus({ info: "Successfully updated", type: "success" });
         } else {
            setActionStatus({ info: "There was an error", type: "error" });
         }
      } catch (error) {
         console.log(error);
      }
   }

   async function addUserToProject(event) {
      event.preventDefault();

      try {
         if (Project.Members.includes(newUser)) {
            setActionStatus({ info: "User already present", type: "info" });
            return;
         }

         let invitationData = {
            recipient: newUser,
            projectName: Project.ProjectName,
         };

         let postOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(invitationData),
         };

         let invitationStream = await fetch(
            "/api/project/invite/new-user",
            postOptions
         );

         let invitationResponse = await invitationStream.json();

         if (invitationResponse.status === "ok") {
            setActionStatus({
               info: "Invitation sent to user",
               type: "success",
            });
            return;
         }
         if (invitationResponse.status === "error") {
            setActionStatus({ info: "User not found", type: "error" });
            return;
         }
      } catch (error) {
         console.log(error);
      }
   }

   return (
      <div>
         <FullScreenDialog
            setActionStatus={setActionStatus}
            isSettingsOpen={isSettingsOpen}
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
                        <div className={classes.optionPair}>
                           <Typography variant="body1" gutterBottom={true}>
                              Invite Only
                           </Typography>
                           <Switch
                              color="primary"
                              checked={inviteOnly}
                              size="medium"
                              onChange={handleSwitchChange}
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
         </FullScreenDialog>
      </div>
   );
}

export default ProjectSettingsModal;
