import { useState, useEffect, useContext } from "react";
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

   const [recipientData, setRecipientData] = useState(null);
   const [allChat, setAllChat] = useState([]);
   const [message, setMessage] = useState("");

   const socket = useContext(SocketInstance);

   useEffect(() => {
      if (!chatSettings.recipient) {
         setChatSettings({
            open: false,
            recipient: null,
         });
      }
   }, [chatSettings, setChatSettings]);

   useEffect(() => {
      const abortFetch = new AbortController();

      async function getRecipientData() {
         try {
            let dataStream = await fetch(
               `/profile/details/${chatSettings.recipient}`,
               {
                  signal: abortFetch.signal,
               }
            );
            let data = await dataStream.json();
            return data
               ? setRecipientData(data)
               : setChatSettings({ open: false, recipient: null });
         } catch (error) {
            console.log(error);
            return;
         }
      }
      getRecipientData();

      return () => abortFetch.abort();
   }, [chatSettings, setChatSettings]);

   useEffect(() => {
      let abortFetch = new AbortController();

      async function getChat() {
         if (!recipientData) return;
         let User1 = User.UniqueUsername;
         let User2 = recipientData.user.UniqueUsername;

         try {
            let responseStream = await fetch(
               `/chat/all-messages?User1=${User1}&User2=${User2}`,
               { signal: abortFetch.signal }
            );
            let responseData = await responseStream.json();
            let chat = responseData.data;
            setAllChat(chat);
         } catch (error) {
            console.log(error);
         }
      }
      getChat();

      return () => abortFetch.abort();
   }, [recipientData, User.UniqueUsername]);

   useEffect(() => {
      socket.on("new-message", messageData => {
         console.log(messageData.content);
         setAllChat(prev => [...prev, messageData]);
      });

      return () => socket.off("message");
   }, [socket]);

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

      let eventData = {
         from: User.UniqueUsername,
         to: recipientData.user.UniqueUsername,
         content: message,
      };

      socket.emit("message", eventData);
   }

   return (
      <div className="chatbox-container">
         <div className="chatbox-controls">
            <MinimizeIcon className={classes.toolIcon} />
            <CloseIcon className={classes.toolIcon} onClick={closeChat} />
         </div>
         <div className="chat-messages-display">
            {allChat.length > 0 &&
               allChat.map((data, index) => {
                  return (
                     <div
                        className={
                           data.Messages.from === User.UniqueUsername
                              ? "right-flex"
                              : "left-flex"
                        }
                        key={data.Messages._id || index}
                     >
                        <div style={{ color: "black" }}>
                           {data.Messages.from}
                        </div>
                        <div style={{ color: "black" }}>
                           {data.Messages.content}
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
