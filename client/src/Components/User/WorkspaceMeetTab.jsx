import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import Fab from "@material-ui/core/Fab";
import { Button } from "@material-ui/core";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import ContentModal from "../UtilityComponents/ContentModal";

const useStyles = makeStyles({
   roomsListContainer: {
      width: "100%",
      display: "flex",
      justifyContent: "center",
      marginTop: "10px",
      "& > div": {
         width: "80%",
      },
   },
   listItem: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      margin: "10px 0",
   },
   createRoomToggle: {
      position: "fixed",
      bottom: "5%",
      right: "5%",
   },
   modalForm: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
   },
   icon: {
      margin: "0 7px",
   },
});

function WorkspaceMeetTab({ tab, activeProject }) {
   const classes = useStyles();

   const [isModalOpen, setIsModalOpen] = useState(false);
   const [newRoomName, setNewRoomName] = useState("");
   const [activeRooms, setActiveRooms] = useState(null);

   const history = useHistory();

   useEffect(() => {
      let abortFetch = new AbortController();
      async function getActiveRooms() {
         try {
            let responseStream = await fetch(
               `/api/meet/active-rooms/${activeProject}`,
               { signal: abortFetch.signal }
            );

            if (abortFetch.signal.aborted) return;

            let response = await responseStream.json();

            if (response.status === "error") throw response.error;

            return setActiveRooms(response.data);
         } catch (error) {
            console.log(error);
         }
      }

      getActiveRooms();

      return () => abortFetch.abort();
   }, [activeProject]);

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

   function goToMeetRoom(roomId) {
      history.push(`/meet-room/${roomId}`);
   }

   return tab === "meet" ? (
      <div>
         <Fab
            className={classes.createRoomToggle}
            color="primary"
            variant="extended"
            onClick={openModal}
         >
            <AddCircleIcon
               fontSize="large"
               color="inherit"
               className={classes.icon}
            />
            Create new room
         </Fab>
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
         <div className={classes.roomsListContainer}>
            <div>
               {activeRooms &&
                  activeRooms.length > 0 &&
                  activeRooms.map(room => {
                     let { roomName, roomId } = JSON.parse(room);
                     return (
                        <div className={classes.listItem} key={roomId}>
                           <Typography variant="h5">{roomName}</Typography>
                           <Button
                              color="primary"
                              size="large"
                              variant="outlined"
                              onClick={() => goToMeetRoom(roomId)}
                           >
                              Join
                           </Button>
                        </div>
                     );
                  })}
            </div>
         </div>
      </div>
   ) : null;
}

export default WorkspaceMeetTab;
