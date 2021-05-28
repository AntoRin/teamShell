import { Link } from "react-router-dom";
import { useState } from "react";
import { IconButton, makeStyles, Tooltip } from "@material-ui/core";
import SettingsInputHdmiIcon from "@material-ui/icons/SettingsInputHdmi";
import ListIcon from "@material-ui/icons/List";
import GeneralConfirmDialog from "../UtilityComponents/GeneralConfirmDialog";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles({
   actionBtn: {
      position: "fixed",
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
      width: "100%",
   },
   cardElements: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      flexWrap: "wrap",
   },
   cardRoot: {
      width: "25%",
      minWidth: "300px",
      height: "300px",
      margin: "30px",
      background: "#555",
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
         console.log(responseData.data.data.files);

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
            <div className={classes.cardElements}>
               {userFiles &&
                  userFiles.map(file => (
                     <>
                        <Card className={classes.cardRoot}>
                           <CardActionArea>
                              <CardMedia
                                 component="img"
                                 alt=""
                                 height="140"
                                 image={file.iconLink}
                                 title=""
                              />
                              <CardContent>
                                 <Typography
                                    gutterBottom
                                    variant="h5"
                                    component="h2"
                                 >
                                    {file.name}
                                 </Typography>
                                 <Typography
                                    variant="body2"
                                    color="textSecondary"
                                    component="p"
                                 >
                                    {file.description}
                                 </Typography>
                              </CardContent>
                           </CardActionArea>
                           <CardActions>
                              <Button
                                 size="small"
                                 color="primary"
                                 href={file.webContentLink}
                                 download={true}
                              >
                                 Download
                              </Button>
                              <Button
                                 size="small"
                                 color="primary"
                                 href={file.webViewLink}
                                 target="_blank"
                              >
                                 Link
                              </Button>
                           </CardActions>
                        </Card>
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
