import { Button } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import MinimizeIcon from "@material-ui/icons/Minimize";
import SendIcon from "@material-ui/icons/Send";
import "../../styles/chatbox.css";

function ChatBox() {
   return (
      <div className="chatbox-container">
         <div className="chatbox-controls">
            <MinimizeIcon />
            <CloseIcon />
         </div>
         <div className="chat-messages-display"></div>
         <div className="chat-message-editor">
            <div className="chat-message-input">
               <form id="chatForm">
                  <input type="text" id="chatInput" />
               </form>
            </div>
            <div className="submit-message">
               <Button>
                  <SendIcon color="secondary" />
               </Button>
            </div>
         </div>
      </div>
   );
}

export default ChatBox;
