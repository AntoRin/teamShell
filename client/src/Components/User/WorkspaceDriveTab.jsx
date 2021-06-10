import React, { useState, useEffect, useContext, useRef } from "react";
import { makeStyles } from "@material-ui/core";
import SettingsInputHdmiIcon from "@material-ui/icons/SettingsInputHdmi";
import RefreshIcon from "@material-ui/icons/Refresh";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import GeneralConfirmDialog from "../UtilityComponents/GeneralConfirmDialog";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import BottomNavigation from "@material-ui/core/BottomNavigation";
import BottomNavigationAction from "@material-ui/core/BottomNavigationAction";
import { GlobalActionStatus } from "../App";
import ContentModal from "../UtilityComponents/ContentModal";
import LinearLoader from "../UtilityComponents/LinearLoader";

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
      justifyContent: "space-around",
      alignItems: "center",
      width: "100%",
      flexWrap: "wrap",
   },
   cardRoot: {
      width: "370px",
      height: "330px",
      margin: "30px",
      background: "#999",
   },
   tabToolBar: {
      width: 500,
      position: "fixed",
      bottom: "10px",
      left: "50%",
      transform: "translateX(-50%)",
      background: "lightblue",
      "& .MuiBottomNavigationAction-label": {
         color: "black",
         fontWeight: "700",
      },
   },
});

function WorkspaceDriveTab({ tab, User, activeProject }) {
   const classes = useStyles();

   const [confirmationRequired, setConfirmationRequired] = useState(false);
   const [userFiles, setUserFiles] = useState(null);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [newFilesAvailable, setNewFilesAvailable] = useState(true);
   const [isLoading, setIsLoading] = useState(false);

   const setActionStatus = useContext(GlobalActionStatus);

   const fileInputElement = useRef();

   useEffect(() => {
      if (tab !== "your-drive") return;

      let abortFetch = new AbortController();
      async function listDriveFiles() {
         setIsLoading(true);
         try {
            let responseStream = await fetch(
               "/api/project/drive/google/list-files",
               { signal: abortFetch.signal }
            );

            if (abortFetch.signal.aborted) return;

            let response = await responseStream.json();

            if (response.status === "ok")
               setUserFiles(response.data.data.files);
            else if (response.status === "error") throw response.error;
         } catch (error) {
            console.log(error);
            return;
         } finally {
            if (!abortFetch.signal.aborted) {
               setNewFilesAvailable(false);
               setIsLoading(false);
            }
         }
      }
      if (newFilesAvailable) listDriveFiles();

      return () => abortFetch.abort();
   }, [newFilesAvailable, tab]);

   function confirmDriveAuthorization() {
      setConfirmationRequired(true);
   }

   function closeConfirmDialog() {
      setConfirmationRequired(false);
   }

   function authorizeDrive() {
      window.location.pathname = "/api/project/drive/google/authorize";
   }

   function refreshFiles() {
      setNewFilesAvailable(true);
   }

   function openCreateModal() {
      setIsModalOpen(true);
   }

   function closeCreateModal() {
      setIsModalOpen(false);
   }

   async function addToProjectFiles(file) {
      let body = {
         creator: User.UniqueUsername,
         project: activeProject,
         name: file.name,
         id: file.id,
         description: file.description,
         mimeType: file.mimeType,
         iconLink: file.iconLink,
         thumbnailLink: file.thumbnailLink,
         webContentLink: file.webContentLink,
         webViewLink: file.webViewLink,
         createdTime: file.createdTime,
      };

      let postOptions = {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(body),
         credentials: "include",
      };

      try {
         let responseStream = await fetch(
            "/api/project/drive/file/add",
            postOptions
         );
         let response = await responseStream.json();

         if (response.status === "ok")
            setActionStatus({ info: "File added to project", type: "success" });
         else if (response.status === "error") throw response.error;
      } catch (error) {
         if (error.name !== "AbortError") {
            setActionStatus({
               info: "There was an error adding file to project",
               type: "error",
            });
            return;
         }
      }
   }

   async function handleNewDriveFile(event) {
      event.preventDefault();
      try {
         let form = event.target;
         let formData = new FormData(form);
         let newFile = fileInputElement.current.files[0];

         formData.append("newDriveFile", newFile);

         let postOptions = {
            method: "POST",
            body: formData,
            credentials: "include",
         };

         let responseStream = await fetch(
            "/api/project/drive/google/create-file",
            postOptions
         );
         let response = await responseStream.json();

         if (response.status === "ok")
            setActionStatus({ info: "File uploaded", type: "success" });
         else if (response.status === "error") throw response.error;
      } catch (error) {
         if (error.name !== "AbortError") {
            setActionStatus({
               info: "There was an error uploading file",
               type: "error",
            });
            return;
         }
      }
   }

   async function handleDeleteDriveFile(fileId) {
      try {
         let deleteOptions = {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileId }),
            credentials: "include",
         };

         let responseStream = await fetch(
            `/api/project/drive/google/delete-file`,
            deleteOptions
         );
         let response = await responseStream.json();

         if (response.status === "ok")
            setActionStatus({
               info: "Deleted file from drive",
               type: "success",
            });
         else if (response.status === "error") throw response.error;
      } catch (error) {
         console.log(error);
         return;
      }
   }

   return tab === "your-drive" ? (
      <div>
         <BottomNavigation showLabels className={classes.tabToolBar}>
            <BottomNavigationAction
               label="Upload file to drive"
               icon={<CloudUploadIcon />}
               onClick={openCreateModal}
            />
            <BottomNavigationAction
               label="List Drive Files"
               icon={<RefreshIcon />}
               onClick={refreshFiles}
            />
            <BottomNavigationAction
               label="Authorize Google Drive"
               icon={<SettingsInputHdmiIcon />}
               onClick={confirmDriveAuthorization}
            />
         </BottomNavigation>
         <ContentModal
            isModalOpen={isModalOpen}
            handleModalClose={closeCreateModal}
         >
            <form encType="multipart/form-data" onSubmit={handleNewDriveFile}>
               <input type="file" ref={fileInputElement} required />
               <Button variant="outlined" color="primary" type="submit">
                  Upload
               </Button>
            </form>
         </ContentModal>
         <div className={classes.driveContainer}>
            <div className={classes.cardElements}>
               {userFiles &&
                  userFiles.map(file => (
                     <React.Fragment key={file.id}>
                        <Card className={classes.cardRoot}>
                           <CardActionArea>
                              <CardMedia
                                 component="img"
                                 alt=""
                                 height="140"
                                 width="auto"
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
                                 color="default"
                                 variant="outlined"
                                 href={file.webContentLink}
                                 download={true}
                              >
                                 Download
                              </Button>
                              <Button
                                 size="small"
                                 color="default"
                                 variant="outlined"
                                 href={file.webViewLink}
                                 target="_blank"
                              >
                                 Link
                              </Button>
                              <Button
                                 size="small"
                                 color="default"
                                 variant="outlined"
                                 onClick={() => addToProjectFiles(file)}
                              >
                                 Add to project files
                              </Button>
                              <Button
                                 size="small"
                                 color="default"
                                 variant="outlined"
                                 onClick={() => handleDeleteDriveFile(file.id)}
                              >
                                 Delete File
                              </Button>
                           </CardActions>
                        </Card>
                     </React.Fragment>
                  ))}
            </div>
            {isLoading && <LinearLoader />}
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
