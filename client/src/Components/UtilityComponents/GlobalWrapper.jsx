import GlobalNav from "./GlobalNav";
import ChatBox from "../User/ChatBox";

function GlobalWrapper({ children, UniqueUsername, ProfileImage }) {
   return (
      <>
         <GlobalNav
            UniqueUsername={UniqueUsername}
            ProfileImage={ProfileImage}
         />
         {children}
         <ChatBox />
      </>
   );
}

export default GlobalWrapper;
