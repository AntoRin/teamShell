import { useState } from "react";
import { IconButton, makeStyles, Tooltip, Typography } from "@material-ui/core";
import SettingsInputHdmiIcon from "@material-ui/icons/SettingsInputHdmi";
import ListIcon from "@material-ui/icons/List";
import GeneralConfirmDialog from "../UtilityComponents/GeneralConfirmDialog";

const useStyles = makeStyles({
   actionBtn: {
      position: "absolute",
      bottom: "15%",
      left: "10px",
   },
   authorize: {
      position: "fixed",
      bottom: "5%",
      left: "10px",
   },
   driveContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "80%",
   },
});

function WorkspaceDriveTab({ tab }) {
   const classes = useStyles();

   const [confirmationRequired, setConfirmationRequired] = useState(false);
   const [userFiles, setUserFiles] = useState(null);

   function confirmDriveAuthorization() {
      setConfirmationRequired(true);
   }

   function closeConfirmDialog() {
      setConfirmationRequired(false);
   }

   function authorizeDrive() {
      window.location.pathname = "/api/project/drive/google/authorize";
   }

   async function listDriveFiles() {
      try {
         let responseStream = await fetch(
            "/api/project/drive/google/list-files"
         );
         let responseData = await responseStream.json();

         if (responseData.status === "ok")
            setUserFiles(responseData.data.data.files);
         else if (responseData.status === "error") throw responseData.error;
      } catch (error) {
         console.log(error);
         return;
      }
   }

   return tab === "Drive" ? (
      <div>
         <Tooltip
            className={classes.actionBtn}
            title="List Drive Files"
            placement="right"
         >
            <IconButton onClick={listDriveFiles}>
               <ListIcon fontSize="large" color="secondary" />
            </IconButton>
         </Tooltip>
         <Tooltip
            className={classes.authorize}
            title="Authorize Google Drive"
            placement="right"
         >
            <IconButton onClick={confirmDriveAuthorization}>
               <SettingsInputHdmiIcon fontSize="large" color="secondary" />
            </IconButton>
         </Tooltip>
         <div className={classes.driveContainer}>
            <div>
               {userFiles &&
                  userFiles.map(file => (
                     <>
                        <Typography
                           variant="h5"
                           color="primary"
                           gutterBottom={true}
                        >
                           {file.name}
                        </Typography>
                        <Typography
                           variant="h5"
                           color="primary"
                           gutterBottom={true}
                        >
                           {file.description}
                        </Typography>
                        <Typography
                           variant="h5"
                           color="primary"
                           gutterBottom={true}
                        >
                           {file.webContentLink}
                        </Typography>
                     </>
                  ))}
            </div>
         </div>
         <GeneralConfirmDialog
            confirmationRequired={confirmationRequired}
            handleConfirmationSuccess={authorizeDrive}
            handleConfirmationFailure={closeConfirmDialog}
            title="Give access to Google Drive?"
            body="Giving access enables the application to create and manage
            files that you create with this application. Close if already
            given access."
         />
      </div>
   ) : null;
}

export default WorkspaceDriveTab;
