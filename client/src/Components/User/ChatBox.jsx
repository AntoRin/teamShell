import { useState, useEffect, useContext, useRef } from "react";
import { Button, makeStyles } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import MinimizeIcon from "@material-ui/icons/Minimize";
import SendIcon from "@material-ui/icons/Send";
import { SocketInstance } from "../UtilityComponents/ProtectedRoute";
import "../../styles/chatbox.css";

const useStyles = makeStyles({
   toolIcon: {
      cursor: "pointer",
   },
});

function ChatBox({ User, chatSettings, setChatSettings }) {
   const classes = useStyles();

   const [allChat, setAllChat] = useState([]);
   const [message, setMessage] = useState("");

   const socket = useContext(SocketInstance);

   const chatRef = useRef();

   useEffect(() => {
      if (!chatSettings.recipient) {
         setChatSettings({
            open: false,
            recipient: null,
         });
      }
   }, [chatSettings, setChatSettings]);

   useEffect(() => {
      let abortFetch = new AbortController();

      async function getChat() {
         if (!chatSettings.recipient) return;
         let User1 = User.UniqueUsername;
         let User2 = chatSettings.recipient;

         try {
            let responseStream = await fetch(
               `/chat/all-messages?User1=${User1}&User2=${User2}`,
               { signal: abortFetch.signal }
            );
            let responseData = await responseStream.json();
            let chat = responseData.data.Messages;
            let chatLatest = chat.reverse();
            setAllChat(chatLatest);
         } catch (error) {
            console.log(error);
         }
      }
      getChat();

      return () => abortFetch.abort();
   }, [chatSettings.recipient, User.UniqueUsername]);

   useEffect(() => {
      socket.on("new-message", messageData => {
         setAllChat(prev => [...prev, messageData.Messages[0]]);
      });

      return () => socket.off("message");
   }, [socket]);

   useEffect(() => {
      chatRef.current.scrollTop += chatRef.current.scrollHeight;
   }, [allChat]);

   function closeChat() {
      setChatSettings({
         open: false,
         recipient: null,
      });
   }

   function handleInputChange(event) {
      setMessage(event.target.value);
   }

   function handleNewMessage(event) {
      event.preventDefault();

      let messageData = {
         from: User.UniqueUsername,
         to: chatSettings.recipient,
         content: message,
      };

      socket.emit("message", messageData);

      setMessage("");
   }

   return (
      <div className="chatbox-container">
         <div className="chatbox-controls">
            <MinimizeIcon className={classes.toolIcon} />
            <CloseIcon className={classes.toolIcon} onClick={closeChat} />
         </div>
         <div ref={chatRef} className="chat-messages-display">
            {allChat.length > 0 &&
               allChat.map((data, index) => {
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
                                 ? "right-flex message-content-wrapper"
                                 : "left-flex message-content-wrapper"
                           }
                        >
                           <div className="message-author">{data.from}</div>
                           <div className="message-content">{data.content}</div>
                        </div>
                     </div>
                  );
               })}
         </div>
         <div className="chat-message-editor">
            <div className="chat-message-input">
               <form id="chatForm" onSubmit={handleNewMessage}>
                  <input
                     onChange={handleInputChange}
                     value={message}
                     type="text"
                     id="chatInput"
                     autoComplete="off"
                  />
                  <Button type="submit">
                     <SendIcon color="secondary" />
                  </Button>
               </form>
            </div>
         </div>
      </div>
   );
}

export default ChatBox;
