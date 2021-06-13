import { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import SwipeableDrawer from "@material-ui/core/SwipeableDrawer";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemText from "@material-ui/core/ListItemText";
import Avatar from "@material-ui/core/Avatar";
import UserSearchBar from "./UserSearchBar";
import CenteredLoader from "./CenteredLoader";
import "../../styles/chat-history.css";

const useStyles = makeStyles({
   rightDrawer: {
      "& .MuiDrawer-paperAnchorRight": {
         background: "#999",
      },
   },
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
      let abortFetch = new AbortController();

      async function getChatHistory() {
         try {
            let chatDataStream = await fetch("/api/chat/chat-history", {
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

   function initiateChat(recipient) {
      setChatSettings({ open: true, recipient });
      closeMessageHistory();
   }

   return (
      <SwipeableDrawer
         anchor="right"
         open={chatHistoryState}
         onClose={closeMessageHistory}
         onOpen={openMessagneHistory}
         className={classes.rightDrawer}
      >
         <List className={classes.drawerList}>
            <ListItem divider>
               <UserSearchBar
                  setChatSettings={setChatSettings}
                  closeMessageHistory={closeMessageHistory}
               />
            </ListItem>
            {chatHistory ? (
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
                        onClick={() => initiateChat(thisChatHistory)}
                     >
                        <ListItemAvatar>
                           <Avatar
                              src={`/api/profile/profile-image/${thisChatHistory}`}
                              alt=""
                           />
                        </ListItemAvatar>
                        <ListItemText primary={thisChatHistory} />
                     </ListItem>
                  );
               })
            ) : (
               <CenteredLoader color="primary" />
            )}
         </List>
      </SwipeableDrawer>
   );
}

export default ChatHistory;
