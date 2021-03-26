import React, { useState, useEffect } from "react";
import { Route, Redirect } from "react-router-dom";

//--------------------Remove credentials for cross-origin------------------

function ProtectedRoute({ component: Component, ...props }) {
   const [authenticated, setAuthenticated] = useState(false);
   const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
      async function verifyUser() {
         let auth = await fetch("http://localhost:5000/auth/verify", {
            credentials: "include",
         });
         let serverResponse = await auth.json();
         if (serverResponse.status === "ok") {
            setAuthenticated(true);
            setIsLoading(false);
         } else {
            setAuthenticated(false);
            setIsLoading(false);
         }
      }
      verifyUser();
   }, []);

   if (isLoading) {
      return (
         <div>
            <h1>Loading...</h1>
         </div>
      );
   } else {
      return authenticated ? (
         <Route
            {...props}
            render={componentProps => {
               return <Component {...componentProps} />;
            }}
         />
      ) : (
         <Redirect to="/" />
      );
   }
}

export default ProtectedRoute;
