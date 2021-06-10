import { useState } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core";
import { Button } from "@material-ui/core";
import ContentModal from "../UtilityComponents/ContentModal";

const useStyles = makeStyles({
   modalForm: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
   },
});

function WorkspaceMeetTab({ tab, activeProject }) {
   const classes = useStyles();

   const [isModalOpen, setIsModalOpen] = useState(false);
   const [newRoomName, setNewRoomName] = useState("");

   const history = useHistory();

   function openModal() {
      setIsModalOpen(true);
   }

   function handleModalClose() {
      setIsModalOpen(false);
   }

   function handleRoomNameChange(event) {
      setNewRoomName(event.target.value);
   }

   async function createNewRoom(event) {
      event.preventDefault();
      try {
         let body = {
            projectName: activeProject,
            roomName: newRoomName,
         };
         let postOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            credentials: "include",
         };

         let responseStream = await fetch("/api/meet/create-room", postOptions);
         let response = await responseStream.json();

         if (response.status === "error") throw response.error;

         let roomId = response.data;

         return history.push(`/meet-room/${roomId}`);
      } catch (error) {
         console.log(error);
      }
   }

   return tab === "meet" ? (
      <div>
         <Button variant="contained" color="primary" onClick={openModal}>
            Create new meeting room
         </Button>
         <ContentModal
            isModalOpen={isModalOpen}
            handleModalClose={handleModalClose}
         >
            <form className={classes.modalForm} onSubmit={createNewRoom}>
               <input
                  type="text"
                  required
                  value={newRoomName}
                  onChange={handleRoomNameChange}
               />
               <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  type="submit"
               >
                  Create
               </Button>
            </form>
         </ContentModal>
      </div>
   ) : null;
}

export default WorkspaceMeetTab;
