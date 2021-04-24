import { useState, useEffect } from "react";
import GlobalNav from "../GlobalNav";
import SolutionEditor from "./SolutionEditor";
import IssueCard from "../User/IssueCard";

function IssueHome({ match, User }) {
   const [issueDetails, setIssueDetails] = useState("");
   const [isAuthorized, setIsAuthorized] = useState(false);
   const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
      let abortFetch = new AbortController();
      async function getIssueDetails() {
         try {
            let rawData = await fetch(
               `http://localhost:5000/issue/${match.params.IssueID}`,
               { credentials: "include", signal: abortFetch.signal }
            );

            if (abortFetch.signal.aborted) return;

            let responseData = await rawData.json();

            if (responseData.status === "error") throw responseData.error;

            setIssueDetails(responseData.data);
            setIsAuthorized(true);
            setIsLoading(false);
         } catch (error) {
            console.log(error);
            setIsAuthorized(false);
            setIssueDetails("");
            setIsLoading(false);
         }
      }

      getIssueDetails();

      return () => abortFetch.abort();
   }, [match.params]);

   if (isLoading) {
      return <h1>Loading...</h1>;
   } else {
      return isAuthorized ? (
         <div className="issue-home-container">
            <GlobalNav
               ProfileImage={User.ProfileImage}
               UniqueUsername={User.UniqueUsername}
            />
            <IssueCard issue={issueDetails} showContent={true} />
            <SolutionEditor />
         </div>
      ) : (
         <h1>Something went wrong</h1>
      );
   }
}

export default IssueHome;
