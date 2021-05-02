import { useState, useEffect } from "react";
import { Route, Redirect } from "react-router-dom";

function NonUserRoute({ component: Component, ...props }) {
   const [isAuthenticated, setIsAuthenticated] = useState(false);
   const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
      async function verifyAuthentication() {
         let verify = await fetch("http://localhost:5000/auth/verify", {
            credentials: "include",
         });
         let verification = await verify.json();

         if (verification.status === "ok") {
            setIsAuthenticated(true);
            setIsLoading(false);
         } else {
            setIsAuthenticated(false);
            setIsLoading(false);
         }
      }
      verifyAuthentication();
   }, []);

   if (isLoading) {
      return <h1>Loading...</h1>;
   } else {
      return !isAuthenticated ? (
         <Route
            {...props}
            render={componentProps => {
               return <Component {...componentProps} />;
            }}
         />
      ) : (
         <Redirect to="/user/home" />
      );
   }
}

export default NonUserRoute;
