import { useState, useEffect } from "react";
import { Route, Redirect } from "react-router-dom";
import ThemeLoader from "./ThemeLoader";

function NonUserRoute({ component: Component, ...props }) {
   const [isAuthenticated, setIsAuthenticated] = useState(false);
   const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
      let abortFetch = new AbortController();

      async function verifyAuthentication() {
         try {
            let verify = await fetch("/api/auth/verify", {
               signal: abortFetch.signal,
            });

            if (abortFetch.signal.aborted) return;

            let verification = await verify.json();

            if (verification.status === "ok") {
               setIsAuthenticated(true);
               setIsLoading(false);
            } else {
               setIsAuthenticated(false);
               setIsLoading(false);
            }
         } catch (error) {
            console.log(error);
         }
      }
      verifyAuthentication();

      return () => abortFetch.abort();
   }, []);

   if (isLoading) {
      return <ThemeLoader />;
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
