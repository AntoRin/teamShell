import React, { useState, useEffect, useContext } from "react";
import { makeStyles } from "@material-ui/core";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Button from "@material-ui/core/Button";
import { SocketInstance } from "../UtilityComponents/ProtectedRoute";

const useStyles = makeStyles({
   chatRoomContainer: {
      display: "grid",
      gridTemplateColumns: "3fr 1fr",
      height: "100%",
      overflowY: "hidden",
   },
   chatContainer: {
      width: "100%",
      height: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      backgroundColor: "#222",
   },
   messages: {
      height: "70%",
      width: "100%",
   },
   chatInput: {
      width: "100%",
   },
   form: {
      width: "100%",
      display: "flex",
      justifyContent: "space-around",
      alignItems: "center",
   },
   textInput: {
      resize: "none",
      width: "75%",
      outline: "none",
   },
   projectMemberList: {
      height: "100%",
      overflowY: "hidden",
      "& .MuiList-root": {
         backgroundColor: "rgb(25, 25, 30)",
         height: "100%",
      },
      margin: "25px 10px",
      borderLeft: "1px solid silver",
      boxShadow: "2px 2px 1px #111",
   },
});

function WorkspaceCreateRoomTab({ projectDetails }) {
   const classes = useStyles();

   const [messages, setMessages] = useState([]);

   const socket = useContext(SocketInstance);

   useEffect(() => {
      async function getMessages() {
         try {
            let responseStream = await fetch(
               `/api/chat/project/${projectDetails.ProjectName}`
            );
            let response = await responseStream.json();

            if (response.data) return setMessages(response.data);
         } catch (error) {
            console.log(error);
         }
      }

      getMessages();
   }, [projectDetails.ProjectName]);

   useEffect(() => {
      socket.on(`new-${projectDetails.ProjectName}-message`, messageData => {});
   }, [projectDetails.ProjectName, socket]);

   async function handleNewMessage() {}

   return (
      <div className={classes.chatRoomContainer}>
         <div className={classes.chatContainer}>
            <div className={classes.messages}>
               {messages &&
                  messages.map(message => <div>{message.content}</div>)}
            </div>
            <div className={classes.chatInput}>
               <form className={classes.form} onSubmit={handleNewMessage}>
                  <textarea rows="3" className={classes.textInput}></textarea>
                  <Button color="primary" variant="outlined">
                     Send
                  </Button>
               </form>
            </div>
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
