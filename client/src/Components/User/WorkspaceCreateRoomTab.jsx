import React, { useState } from "react";
import { makeStyles } from "@material-ui/core";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Button from "@material-ui/core/Button";
import ContentModal from "../UtilityComponents/ContentModal";

const useStyles = makeStyles({
   createRoomContainer: {
      display: "grid",
      gridTemplateColumns: "3fr 1fr",
      height: "100%",
   },
   roomConfig: {
      margin: "25px 10px",
   },
   projectMemberList: {
      height: "100%",
      "& .MuiList-root": {
         backgroundColor: "rgb(25, 25, 30)",
         height: "100%",
      },
      margin: "25px 10px",
   },
   newRoomForm: {
      minHeight: "100px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
   },
   formInput: {
      fontSize: "1.2rem",
   },
});

function WorkspaceCreateRoomTab({ projectDetails }) {
   const classes = useStyles();

   const [isModalOpen, setIsModalOpen] = useState(false);
   const [newRoomName, setNewRoomName] = useState("");

   function openModal() {
      setIsModalOpen(true);
   }

   function handleModalClose() {
      setIsModalOpen(false);
   }

   function handleRoomNameChange(event) {
      setNewRoomName(event.target.value);
   }

   async function handleNewRoom(event) {
      event.preventDefault();

      try {
         let body = {
            projectName: projectDetails.ProjectName,
            roomName: newRoomName,
         };

         let postOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
         };
         let responseStream = await fetch(
            "/api/project-rooms/chat-room/create",
            postOptions
         );
         let response = await responseStream.json();

         if (response.status === "ok") console.log(response.data);
         else if (response.status === "error") throw response.error;
      } catch (error) {
         console.log(error);
         return;
      }
   }

   return (
      <div className={classes.createRoomContainer}>
         <div className={classes.roomConfig}>
            <Button variant="contained" size="large" onClick={openModal}>
               Create new room
            </Button>
            <ContentModal
               isModalOpen={isModalOpen}
               handleModalClose={handleModalClose}
            >
               <form
                  autoComplete="off"
                  className={classes.newRoomForm}
                  onSubmit={handleNewRoom}
               >
                  <input
                     className={classes.formInput}
                     required
                     value={newRoomName}
                     onChange={handleRoomNameChange}
                  />{" "}
                  <br />
                  <Button
                     color="primary"
                     size="small"
                     variant="outlined"
                     type="submit"
                  >
                     Create
                  </Button>
               </form>
            </ContentModal>
         </div>
         <div className={classes.projectMemberList}>
            <List>
               {projectDetails.Members &&
                  projectDetails.Members.map(member => (
                     <React.Fragment key={member}>
                        <ListItem button divider>
                           <ListItemText primary={member} />
                        </ListItem>
                     </React.Fragment>
                  ))}
            </List>
         </div>
      </div>
   );
}

export default WorkspaceCreateRoomTab;
