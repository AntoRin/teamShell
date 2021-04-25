import { useState, useEffect } from "react";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core";
import GlobalNav from "../GlobalNav";
import SolutionEditor from "./SolutionEditor";
import IssueCard from "../User/IssueCard";
import "../../styles/issue-home.css";

const useStyles = makeStyles({
   "component-title": {
      color: "lightgreen",
      background: "#222",
      padding: "7px",
      marginTop: "50px",
   },
});

function IssueHome({ match, User }) {
   const classes = useStyles();

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
            <div className="issue-home-contents-wrapper">
               <div className="issue-statement-description-main">
                  <IssueCard issue={issueDetails} showContent={true} />
               </div>
               <div className="solutions-read-section"></div>
               <div className="solutions-write-section">
                  <Typography
                     className={classes["component-title"]}
                     align="center"
                     variant="h4"
                     gutterBottom
                  >
                     Write your solution here
                  </Typography>
                  <SolutionEditor />
               </div>
            </div>
         </div>
      ) : (
         <h1>Something went wrong</h1>
      );
   }
}

export default IssueHome;
