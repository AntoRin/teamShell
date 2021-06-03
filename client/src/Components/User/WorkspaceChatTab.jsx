import React, { useState, useEffect, useContext, useRef } from "react";
import { makeStyles } from "@material-ui/core";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Button from "@material-ui/core/Button";
import { SocketInstance } from "../UtilityComponents/ProtectedRoute";
import "../../styles/chatbox.css";

const useStyles = makeStyles({
   chatRoomContainer: {
      display: "grid",
      gridTemplateColumns: "3fr 1fr",
      height: "100%",
   },
   chatContainer: {
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(50, 50, 100, 0.1)",
      overflowY: "hidden",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
   },
   messages: {
      maxHeight: "75%",
      width: "100%",
      overflowY: "scroll",
   },
   chatInput: {
      width: "100%",
      height: "30%",
      borderTop: "1px solid lightblue",
      margin: "10px 0",
      paddingTop: "15px",
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
         overflowY: "scroll",
      },
      margin: "25px 10px",
      borderLeft: "1px solid silver",
      boxShadow: "2px 2px 1px #111",
   },
});

function WorkspaceChatTab({ User, projectDetails }) {
   const classes = useStyles();

   const [messages, setMessages] = useState([]);
   const [newMessageContent, setNewMessageContent] = useState("");

   const socket = useContext(SocketInstance);

   const chatRef = useRef();

   useEffect(() => {
      let abortFetch = new AbortController();
      async function getMessages() {
         try {
            let responseStream = await fetch(
               `/api/chat/project/${projectDetails.ProjectName}`,
               { signal: abortFetch.signal }
            );
            let response = await responseStream.json();

            if (abortFetch.signal.aborted) return;

            if (response.data) return setMessages(response.data);
         } catch (error) {
            console.log(error);
         }
      }

      getMessages();

      return () => abortFetch.abort();
   }, [projectDetails.ProjectName]);

   useEffect(() => {
      socket.emit("join-project-room", projectDetails.ProjectName);

      return () =>
         socket.emit("leave-project-room", projectDetails.ProjectName);
   }, [projectDetails.ProjectName, socket]);

   useEffect(() => {
      socket.on("new-incoming-message", message => {
         setMessages(prev => [...prev, message]);
      });

      return () => socket.off("new-incoming-message");
   }, [projectDetails.ProjectName, socket]);

   useEffect(() => {
      if (chatRef.current)
         chatRef.current.scrollTop += chatRef.current.scrollHeight;
   }, [messages]);

   function handleNewMessage(event) {
      event.preventDefault();

      let messageData = {
         content: newMessageContent,
         from: User.UniqueUsername,
         ProjectName: projectDetails.ProjectName,
      };
      socket.emit(`new-project-message`, messageData);

      setNewMessageContent("");
   }

   function handleInputChange(event) {
      setNewMessageContent(event.target.value);
   }

   return (
      <div className={classes.chatRoomContainer}>
         <div className={classes.chatContainer}>
            <div className={classes.messages} ref={chatRef}>
               {messages &&
                  messages.map((data, index) => {
                     return (
                        <div
                           key={data._id || index}
                           className={
                              data.from === User.UniqueUsername
                                 ? "right-flex message-block"
                                 : "left-flex message-block"
                           }
                        >
                           <div
                              className={
                                 data.from === User.UniqueUsername
                                    ? "right-flex message-content-wrapper message-special"
                                    : "left-flex message-content-wrapper"
                              }
                           >
                              <div className="message-author">{data.from}</div>
                              <div className="message-content">
                                 {data.content}
                              </div>
                           </div>
                        </div>
                     );
                  })}
            </div>
            <div className={classes.chatInput}>
               <form className={classes.form} onSubmit={handleNewMessage}>
                  <textarea
                     rows="3"
                     className={classes.textInput}
                     value={newMessageContent}
                     onChange={handleInputChange}
                  ></textarea>
                  <Button color="primary" variant="outlined" type="submit">
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

export default WorkspaceChatTab;
