import { useState, useEffect } from "react";
import { ClickAwayListener } from "@material-ui/core";
import "../../styles/chat-history.css";

function ChatHistory({
   UniqueUsername,
   chatHistoryState,
   setChatHistoryState,
   setChatSettings,
}) {
   const [chatHistory, setChatHistory] = useState(null);

   useEffect(() => {
      if (!chatHistoryState) return;

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

   function initiateChat(event) {
      setChatSettings({ open: true, recipient: event.target.textContent });
      closeMessageHistory();
   }

   return chatHistoryState ? (
      <ClickAwayListener onClickAway={closeMessageHistory}>
         <div className="message-history-container">
            <div className="all-chat-history">
               {chatHistory &&
                  chatHistory.length > 0 &&
                  chatHistory.map(chat => {
                     let thisChatHistory = chat.Users.find(
                        user => user !== UniqueUsername
                     );
                     return (
                        <div
                           key={chat.ChatID}
                           onClick={initiateChat}
                           className="chat-history-block"
                        >
                           {thisChatHistory}
                        </div>
                     );
                  })}
            </div>
         </div>
      </ClickAwayListener>
   ) : null;
}

export default ChatHistory;
