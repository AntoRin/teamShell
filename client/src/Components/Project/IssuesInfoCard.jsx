import { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import LinearProgress from "@material-ui/core/LinearProgress";
import { useHistory } from "react-router";

const useStyles = makeStyles({
   issueListItem: {
      display: "grid",
      gridTemplateColumns: "2fr 1fr 1fr",
      gap: "10px",
      margin: "10px",
   },
   issueTitle: {
      borderLeft: "2px solid #33006f",
      paddingLeft: "10px",
   },
   issueTabBtn: {
      "&.MuiButton-root": {
         color: "rgb(108, 98, 190)",
      },
   },
   issueInfoTable: {
      display: "flex",
      justifyContent: "flex-start",
      alignItems: "center",
      borderBottom: "1px solid rgb(51, 0, 111, 0.5)",
      margin: "10px 10px 10px 20px",
   },
});

function IssuesInfoCard({ Issue }) {
   const classes = useStyles();

   const [requestInfo, setRequestInfo] = useState(false);
   const [issueInfo, setIssueInfo] = useState(null);
   const [isLoading, setIsLoading] = useState(false);

   const history = useHistory();

   useEffect(() => {
      if (!requestInfo) return;

      let abortFetch = new AbortController();

      async function getIssueInfo() {
         setIsLoading(true);
         try {
            let dataStream = await fetch(`/api/issue/snippet/${Issue._id}`, {
               signal: abortFetch.signal,
            });
            let responseData = await dataStream.json();

            if (abortFetch.signal.aborted) return;

            if (responseData.status === "error") throw responseData.error;

            if (responseData.status === "ok") {
               setIssueInfo(responseData.data);
               setIsLoading(false);
            }
         } catch (error) {
            if (error.name !== "AbortError") {
               setIssueInfo(null);
               setIsLoading(false);
            }
         }
      }

      getIssueInfo();

      return () => abortFetch.abort();
   }, [requestInfo, Issue]);

   function handleInfoRequest() {
      setRequestInfo(prev => !prev);
   }

   function goToIssue() {
      history.push(`/issue/${Issue._id}`);
   }

   return (
      <>
         <div className={classes.issueListItem}>
            <Typography className={classes.issueTitle} variant="h5">
               {Issue.IssueTitle}
            </Typography>
            <Button
               className={classes.issueTabBtn}
               variant="text"
               endIcon={<OpenInNewIcon />}
               size="large"
               onClick={goToIssue}
            >
               Visit
            </Button>
            <Button
               className={classes.issueTabBtn}
               variant="text"
               endIcon={requestInfo ? <ExpandLessIcon /> : <ExpandMoreIcon />}
               size="large"
               onClick={handleInfoRequest}
            >
               More Details
            </Button>
         </div>
         {requestInfo && issueInfo ? (
            Object.keys(issueInfo).map((dataKey, index) => {
               return (
                  <div className={classes.issueInfoTable} key={index}>
                     <Typography
                        variant="h6"
                        color="primary"
                        gutterBottom={true}
                     >
                        {dataKey}: &nbsp; &nbsp;
                     </Typography>
                     <Typography variant="h6" gutterBottom={true}>
                        {issueInfo[dataKey]}
                     </Typography>
                  </div>
               );
            })
         ) : isLoading ? (
            <LinearProgress className={classes.linearLoader} variant="query" />
         ) : null}
      </>
   );
}

export default IssuesInfoCard;
