import React, { useState, useEffect } from "react";

export const AuthContext = React.createContext();

function AuthContextProvider({ children }) {
   const [user, setUser] = useState({
      username: "",
   });

   useEffect(() => {
      async function verifyUser() {
         console.log("Request for Auth has been sent");
         let auth = await fetch("http://localhost:5000/auth/verify", {
            credentials: "include",
         });
         let serverResponse = await auth.json();
         if (serverResponse.status === "ok") {
            setUser({ username: "Anto" });
         }
      }
      verifyUser();
   }, []);

   return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}

export default AuthContextProvider;
