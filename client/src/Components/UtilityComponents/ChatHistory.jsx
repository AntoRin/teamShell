import { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import SwipeableDrawer from "@material-ui/core/SwipeableDrawer";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import UserSearchBar from "./UserSearchBar";
import "../../styles/chat-history.css";

const useStyles = makeStyles({
   drawerList: {
      minWidth: "350px",
   },
});

function ChatHistory({
   UniqueUsername,
   chatHistoryState,
   setChatHistoryState,
   setChatSettings,
}) {
   const classes = useStyles();

   const [chatHistory, setChatHistory] = useState(null);

   useEffect(() => {
      // if (!chatHistoryState) return;

      let abortFetch = new AbortController();

      async function getChatHistory() {
         try {
            let chatDataStream = await fetch("/chat/chat-history", {
               signal: abortFetch.signal,
            });
            let chatData = await chatDataStream.json();
            setChatHistory(chatData.data);
         } catch (error) {
            console.log(error);
            return;
         }
      }

      getChatHistory();

      return () => abortFetch.abort();
   }, [chatHistoryState]);

   function closeMessageHistory() {
      setChatHistoryState(false);
   }

   function openMessagneHistory() {
      setChatHistoryState(true);
   }

   function initiateChat(event) {
      setChatSettings({ open: true, recipient: event.target.textContent });
      closeMessageHistory();
   }

   return (
      <SwipeableDrawer
         anchor="right"
         open={chatHistoryState}
         onClose={closeMessageHistory}
         onOpen={openMessagneHistory}
      >
         <List className={classes.drawerList}>
            <ListItem divider>
               <UserSearchBar
                  setChatSettings={setChatSettings}
                  closeMessageHistory={closeMessageHistory}
               />
            </ListItem>
            {chatHistory &&
               chatHistory.length > 0 &&
               chatHistory.map(chat => {
                  let thisChatHistory = chat.Users.find(
                     user => user !== UniqueUsername
                  );
                  return (
                     <ListItem
                        button
                        divider
                        key={chat.ChatID}
                        onClick={initiateChat}
                     >
                        <ListItemText primary={thisChatHistory} />
                     </ListItem>
                  );
               })}
         </List>
      </SwipeableDrawer>
   );
}

export default ChatHistory;
