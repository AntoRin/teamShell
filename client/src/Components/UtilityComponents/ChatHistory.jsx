import { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import SwipeableDrawer from "@material-ui/core/SwipeableDrawer";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemText from "@material-ui/core/ListItemText";
import Avatar from "@material-ui/core/Avatar";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import HistoryIcon from "@material-ui/icons/History";
import GroupIcon from "@material-ui/icons/Group";
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
      minHeight: "100%",
      position: "relative",
   },
   loaderContainer: {
      position: "relative",
   },
});

function ChatHistory({
   chatHistoryState,
   setChatHistoryState,
   setChatSettings,
}) {
   const classes = useStyles();

   const [chatHistory, setChatHistory] = useState(null);
   const [historyCache, setHistoryCache] = useState(null);
   const [contactsCache, setContactsCache] = useState(null);
   const [tab, setTab] = useState("history");
   const [isLoading, setIsLoading] = useState(false);

   useEffect(() => {
      if (!chatHistoryState) return;

      let listDataUrl =
         tab === "history"
            ? "/api/chat/chat-history"
            : "/api/profile/all-contacts";

      let abortFetch = new AbortController();

      async function getTabList() {
         if (tab === "history" && historyCache)
            return setChatHistory(historyCache);
         if (tab === "contacts" && contactsCache)
            return setChatHistory(contactsCache);

         setIsLoading(true);
         try {
            let chatDataStream = await fetch(listDataUrl, {
               signal: abortFetch.signal,
            });

            if (abortFetch.signal.aborted) return;

            let chatData = await chatDataStream.json();

            if (chatData.status === "error") throw chatData.error;

            setChatHistory(chatData.data);
            tab === "history"
               ? setHistoryCache(chatData.data)
               : setContactsCache(chatData.data);
            setIsLoading(false);
         } catch (error) {
            if (error.name !== "AbortError") {
               console.log(error);
               return setIsLoading(false);
            }
         }
      }

      getTabList();

      return () => abortFetch.abort();
   }, [chatHistoryState, tab, contactsCache, historyCache]);

   useEffect(() => {
      return () => {
         setHistoryCache(null);
         setContactsCache(null);
      };
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

   function handleTabChange(_, tabName) {
      if (tabName !== null) setTab(tabName);
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
               <ToggleButtonGroup
                  exclusive
                  value={tab}
                  onChange={handleTabChange}
               >
                  <ToggleButton value="history">
                     <HistoryIcon />
                  </ToggleButton>
                  <ToggleButton value="contacts">
                     <GroupIcon />
                  </ToggleButton>
               </ToggleButtonGroup>
            </ListItem>
            {tab === "contacts" && (
               <ListItem divider>
                  <UserSearchBar
                     setChatSettings={setChatSettings}
                     closeMessageHistory={closeMessageHistory}
                  />
               </ListItem>
            )}
            {!isLoading ? (
               chatHistory ? (
                  chatHistory.length > 0 &&
                  chatHistory.map(chatRecipient => {
                     return (
                        <ListItem
                           button
                           divider
                           key={chatRecipient}
                           onClick={() => initiateChat(chatRecipient)}
                        >
                           <ListItemAvatar>
                              <Avatar
                                 src={`/api/profile/profile-image/${chatRecipient}`}
                                 alt=""
                              />
                           </ListItemAvatar>
                           <ListItemText primary={chatRecipient} />
                        </ListItem>
                     );
                  })
               ) : (
                  <ListItem
                     primary={
                        tab === "history" ? "No recent chat" : "No contacts"
                     }
                  ></ListItem>
               )
            ) : (
               <CenteredLoader color="primary" absolutelyPositioned />
            )}
         </List>
      </SwipeableDrawer>
   );
}

export default ChatHistory;
