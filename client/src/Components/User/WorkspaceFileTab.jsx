import { useState, useEffect, useContext } from "react";
import { makeStyles, Typography } from "@material-ui/core";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Button from "@material-ui/core/Button";
import { GlobalActionStatus } from "../App";
import LinearLoader from "../UtilityComponents/LinearLoader";

const useStyles = makeStyles({
   filesContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      height: "100%",
   },
   cardRoot: {
      width: "370px",
      height: "350px",
      margin: "30px",
      background: "#999",
   },
});

function WorkspaceFileTab({ tab, User, activeProject }) {
   const classes = useStyles();

   const [filesData, setFilesData] = useState(null);
   const [isLoading, setIsLoading] = useState(false);

   const setActionStatus = useContext(GlobalActionStatus);

   useEffect(() => {
      if (tab !== "project-files") return;

      let abortFetch = new AbortController();
      async function getProjectFiles() {
         setIsLoading(true);
         try {
            let responseStream = await fetch(
               `/api/project/drive/files/get/${activeProject}`,
               {
                  signal: abortFetch.signal,
               }
            );

            if (abortFetch.signal.aborted) return;

            let response = await responseStream.json();

            if (response.status === "ok") {
               setFilesData(response.data);
               setIsLoading(false);
            } else if (response.status === "error") throw response.error;
         } catch (error) {
            if (error.name !== "AbortError") {
               setFilesData(null);
               setIsLoading(false);
            }
         }
      }

      getProjectFiles();

      return () => abortFetch.abort();
   }, [activeProject, tab]);

   async function deleteFileFromProject(fileId) {
      try {
         let deleteOptions = {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileId }),
         };

         let responseStream = await fetch(
            `/api/project/drive/file/remove`,
            deleteOptions
         );
         let response = await responseStream.json();

         if (response.status === "ok")
            setActionStatus({
               info: "Removed file from project",
               type: "success",
            });
         else if (response.status === "error") throw response.error;
      } catch (error) {
         console.log(error);
         return;
      }
   }

   return tab === "project-files" ? (
      <div className={classes.filesContainer}>
         <>
            {filesData
               ? filesData.map(file => (
                    <Card key={file.id} className={classes.cardRoot}>
                       <CardActionArea>
                          <CardMedia
                             component="img"
                             alt=""
                             height="140"
                             width="auto"
                             image={file.iconLink}
                             title=""
                          />
                          <CardContent>
                             <Typography variant="h6" gutterBottom>
                                {file.creator}
                             </Typography>
                             <Typography
                                variant="h5"
                                component="h2"
                                gutterBottom
                             >
                                {file.name}
                             </Typography>
                             <Typography
                                variant="body2"
                                color="textSecondary"
                                component="p"
                             >
                                {file.description}
                             </Typography>
                          </CardContent>
                       </CardActionArea>
                       <CardActions>
                          <Button
                             size="small"
                             color="default"
                             variant="outlined"
                             href={file.webContentLink}
                             download={true}
                          >
                             Download
                          </Button>
                          <Button
                             size="small"
                             color="default"
                             variant="outlined"
                             href={file.webViewLink}
                             target="_blank"
                          >
                             Link
                          </Button>
                          {User.UniqueUsername === file.creator && (
                             <Button
                                size="small"
                                color="default"
                                variant="outlined"
                                onClick={() => deleteFileFromProject(file.id)}
                             >
                                Remove file from project
                             </Button>
                          )}
                       </CardActions>
                    </Card>
                 ))
               : null}
         </>
         {isLoading && <LinearLoader />}
      </div>
   ) : null;
}

export default WorkspaceFileTab;
