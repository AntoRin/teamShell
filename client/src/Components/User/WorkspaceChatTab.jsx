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
      maxHeight: "80vh",
      overflowY: "hidden",
   },
   chatContainer: {
      width: "100%",
      height: "70vh",
      backgroundColor: "rgba(50, 50, 100, 0.1)",
      overflowY: "hidden",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      margin: "25px 10px",
   },
   messages: {
      height: "70%",
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
      height: "90%",
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

function WorkspaceChatTab({ User, activeProject, projectMembers }) {
   const classes = useStyles();

   const [messages, setMessages] = useState([]);
   const [newMessageContent, setNewMessageContent] = useState("");
   const [recordActive, setRecordActive] = useState(false);

   const socket = useContext(SocketInstance);

   const chatRef = useRef();
   const voiceRecorderRef = useRef();

   useEffect(() => {
      let abortFetch = new AbortController();
      async function getMessages() {
         try {
            let responseStream = await fetch(
               `/api/chat/project/${activeProject}`,
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
   }, [activeProject]);

   useEffect(() => {
      socket.emit("join-project-room", activeProject);

      return () => socket.emit("leave-project-room", activeProject);
   }, [activeProject, socket]);

   useEffect(() => {
      socket.on("new-incoming-message", message => {
         setMessages(prev => [...prev, message]);
      });

      return () => socket.off("new-incoming-message");
   }, [activeProject, socket]);

   useEffect(() => {
      if (chatRef.current)
         chatRef.current.scrollTop += chatRef.current.scrollHeight;
   }, [messages]);

   function handleInputChange(event) {
      setNewMessageContent(event.target.value);
   }

   function handleNewMessage(event, messageType = "text", audioBlob = null) {
      event && event.preventDefault();

      let content;

      if (messageType === "audio") content = audioBlob;
      else content = newMessageContent;

      let messageData = {
         content,
         from: User.UniqueUsername,
         ProjectName: activeProject,
         messageType,
      };
      socket.emit(`new-project-message`, messageData);

      setNewMessageContent("");
   }

   async function recordVoiceMessage() {
      setRecordActive(true);
      let voiceChunks = [];

      try {
         let voiceStream = await new Promise((resolve, reject) => {
            window.navigator.getUserMedia(
               { audio: true, video: false },
               stream => resolve(stream),
               error => reject(error)
            );
         });
         voiceRecorderRef.current = new window.MediaRecorder(voiceStream);

         voiceRecorderRef.current.ondataavailable = voiceData => {
            voiceChunks.push(voiceData.data);
         };

         voiceRecorderRef.current.start();

         let requestData = setInterval(
            () =>
               voiceStream.active &&
               voiceRecorderRef.current.state === "recording" &&
               voiceRecorderRef.current.requestData()
         );

         voiceRecorderRef.current.onstop = () => {
            setRecordActive(false);
            clearInterval(requestData);
            voiceStream.getTracks()[0].stop();

            let voiceBlob = new Blob(voiceChunks);

            handleNewMessage(null, "audio", voiceBlob);
         };
      } catch (error) {
         console.log(error);
      }
   }

   function stopRecording() {
      voiceRecorderRef.current.stop();
   }

   function getAudioDataUrl(bin) {
      try {
         let raw = window.atob(bin);

         let bytes = new Uint8Array(raw.length);

         for (let i = 0; i < raw.length; i++) {
            bytes[i] = raw.charCodeAt(i);
         }
         let voiceBlob = new Blob([bytes.buffer], { type: "audio/ogg" });
         let voiceUrl = URL.createObjectURL(voiceBlob);

         return voiceUrl;
      } catch (error) {
         console.log(error);
      }
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
                                 {data.messageType === "audio" ? (
                                    <audio controls>
                                       <source
                                          src={getAudioDataUrl(data.content)}
                                          type="audio/ogg"
                                       />
                                    </audio>
                                 ) : (
                                    data.content
                                 )}
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
                  <Button
                     color="primary"
                     variant="outlined"
                     onClick={recordActive ? stopRecording : recordVoiceMessage}
                  >
                     {recordActive ? "Stop" : "Start"}
                  </Button>
               </form>
            </div>
         </div>
         <div className={classes.projectMemberList}>
            <List>
               {projectMembers &&
                  projectMembers.map(member => (
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
