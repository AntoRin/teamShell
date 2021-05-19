import React, { useState, useEffect, createContext } from "react";
import { Route, Redirect } from "react-router-dom";
import io from "socket.io-client";
import GlobalNav from "./GlobalNav";
import ChatBox from "../User/ChatBox";
import CenteredLoader from "./CenteredLoader";

export const SocketInstance = createContext();

function ProtectedRoute({ component: Component, ...props }) {
   const [User, setUser] = useState({});
   const [authenticated, setAuthenticated] = useState(false);
   const [isLoading, setIsLoading] = useState(true);
   const [socket, setSocket] = useState("");
   const [chatSettings, setChatSettings] = useState({
      open: false,
      recipient: null,
   });

   useEffect(() => {
      setSocket(
         io("http://localhost:5000", {
            withCredentials: true,
            reconnectionAttempts: 5,
         })
      );
   }, []);

   useEffect(() => {
      return () => {
         if (socket.connected) socket.disconnect();
      };
   }, [socket]);

   useEffect(() => {
      let abortFetch = new AbortController();
      async function verifyUser() {
         try {
            let auth = await fetch("/auth/verify", {
               credentials: "include",
               signal: abortFetch.signal,
            });

            if (abortFetch.signal.aborted) return;

            let serverResponse = await auth.json();
            if (serverResponse.status === "ok") {
               setAuthenticated(true);
               setUser(serverResponse.User);
               setIsLoading(false);
            } else {
               setAuthenticated(false);
               setIsLoading(false);
            }
         } catch (error) {
            console.log("The request was aborted");
         }
      }
      verifyUser();

      return () => abortFetch.abort();
   }, [Component]);

   if (isLoading || !socket) {
      return <CenteredLoader color="secondary" backdrop={true} />;
   } else {
      return authenticated ? (
         <SocketInstance.Provider value={socket}>
            <Route
               {...props}
               render={componentProps => {
                  return (
                     <>
                        <GlobalNav
                           UniqueUsername={User.UniqueUsername}
                           ProfileImage={User.ProfileImage}
                           setChatSettings={setChatSettings}
                        />
                        <Component
                           {...componentProps}
                           GlobalNav={GlobalNav}
                           setChatSettings={setChatSettings}
                           User={User}
                        />
                        {chatSettings.open && (
                           <ChatBox
                              User={User}
                              chatSettings={chatSettings}
                              setChatSettings={setChatSettings}
                           />
                        )}
                     </>
                  );
               }}
            />
         </SocketInstance.Provider>
      ) : (
         <Redirect to="/" />
      );
   }
}

export default ProtectedRoute;
