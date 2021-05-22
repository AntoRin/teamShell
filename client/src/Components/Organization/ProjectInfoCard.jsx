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
   projectListItem: {
      display: "grid",
      gridTemplateColumns: "2fr 1fr 1fr",
      gap: "10px",
      margin: "10px",
   },
   projectTitle: {
      borderLeft: "2px solid #33006f",
      paddingLeft: "10px",
   },
   projectTabBtn: {
      "&.MuiButton-root": {
         color: "rgb(108, 98, 190)",
      },
   },
   projectInfoTable: {
      display: "flex",
      justifyContent: "flex-start",
      alignItems: "center",
      borderBottom: "1px solid rgb(51, 0, 111, 0.5)",
      margin: "10px 10px 10px 20px",
   },
});

function ProjectInfoCard({ project, organization }) {
   const classes = useStyles();

   const [requestInfo, setRequestInfo] = useState(false);
   const [projectInfo, setProjectInfo] = useState(null);
   const [isLoading, setIsLoading] = useState(false);

   const history = useHistory();

   useEffect(() => {
      if (!requestInfo) return;

      let abortFetch = new AbortController();
      async function getProjectSnippet() {
         setIsLoading(true);
         try {
            let dataStream = await fetch(`/api/project/snippet/${project}`, {
               signal: abortFetch.signal,
            });
            let responseData = await dataStream.json();

            if (abortFetch.signal.aborted) return;

            if (responseData.status === "ok") {
               setProjectInfo(responseData.data);
               setIsLoading(false);
            } else {
               setProjectInfo(null);
               setIsLoading(false);
            }
         } catch (error) {
            console.log(error);
         }
      }

      getProjectSnippet();

      return () => abortFetch.abort();
   }, [requestInfo, project]);

   function handleInfoRequest() {
      setRequestInfo(prev => !prev);
   }

   function goToProject() {
      history.push(`/project/${organization}/${project}`);
   }

   return (
      <>
         <div className={classes.projectListItem}>
            <Typography className={classes.projectTitle} variant="h5">
               {project}
            </Typography>
            <Button
               className={classes.projectTabBtn}
               variant="text"
               endIcon={<OpenInNewIcon />}
               size="large"
               onClick={goToProject}
            >
               Visit
            </Button>
            <Button
               className={classes.projectTabBtn}
               variant="text"
               endIcon={requestInfo ? <ExpandLessIcon /> : <ExpandMoreIcon />}
               size="large"
               onClick={handleInfoRequest}
            >
               More Details
            </Button>
         </div>
         {requestInfo && projectInfo ? (
            Object.keys(projectInfo).map((dataKey, index) => {
               return (
                  <div className={classes.projectInfoTable} key={index}>
                     <Typography
                        variant="h6"
                        color="primary"
                        gutterBottom={true}
                     >
                        {dataKey}: &nbsp; &nbsp;
                     </Typography>
                     <Typography variant="h6" gutterBottom={true}>
                        {projectInfo[dataKey]}
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

export default ProjectInfoCard;
