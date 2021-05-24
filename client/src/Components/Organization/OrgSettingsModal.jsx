import { useState } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import ListItemText from "@material-ui/core/ListItemText";
import ListItem from "@material-ui/core/ListItem";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import SaveAltIcon from "@material-ui/icons/SaveAlt";
import AddToPhotosIcon from "@material-ui/icons/AddToPhotos";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
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

function OrgSettingsModal({
   User,
   match,
   Organization,
   isSettingsOpen,
   setIsSettingsOpen,
}) {
   const classes = useStyles();

   const [newDescription, setNewDescription] = useState(
      Organization.Description
   );
   const [newUser, setNewUser] = useState("");
   const [addUserQuery, setAddUserQuery] = useState(false);
   const [actionStatus, setActionStatus] = useState({
      info: null,
      type: "success",
   });

   const history = useHistory();

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

      if (!Organization.Creator !== User.UniqueUsername) return;

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

      let updateRequest = await fetch("/api/organization/edit", postOptions);
      let updateResponse = await updateRequest.json();

      if (updateResponse.status === "ok") {
         setActionStatus({ info: "Successfully updated", type: "success" });
      } else {
         setActionStatus({ info: "There was an error", type: "error" });
      }
   }

   async function addUserToOrg(event) {
      event.preventDefault();

      if (Organization.Creator !== User.UniqueUsername) return;

      if (Organization.Members.includes(newUser)) {
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
            target_category: "Organization",
            target_name: Organization.OrganizationName,
            target_info: `Organization with ${Organization.Members.length} member(s)`,
         },
      };

      let postOptions = {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(invitationData),
         credentials: "include",
      };

      let invitationStream = await fetch(
         "/api/organization/invite/new-user",
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

   function createProjectRedirect() {
      let projectUrl = `/create/project?Organization=${match.params.OrganizationName}`;
      history.push(projectUrl);
   }

   return (
      <div>
         <FullScreenDialog
            actionStatus={actionStatus}
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
                     <form onSubmit={updateOrgSettings}>
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
                     Add a new user to your organization
                  </Button>
               </ListItem>
               {addUserQuery && (
                  <ListItem>
                     <form id="addUserToOrgForm" onSubmit={addUserToOrg}>
                        <TextField
                           onChange={handleNewUserNameChange}
                           value={newUser}
                           type="text"
                           label="Unique Username of the User"
                           fullWidth
                           margin="normal"
                           variant="filled"
                           autoComplete="off"
                           id="addUserInput_OrgModal"
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
               <ListItem>
                  <Button
                     onClick={createProjectRedirect}
                     endIcon={<OpenInNewIcon />}
                  >
                     Create a new project
                  </Button>
               </ListItem>
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

export default OrgSettingsModal;
