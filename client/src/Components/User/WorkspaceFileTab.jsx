import { useState, useEffect } from "react";
import { makeStyles, Typography } from "@material-ui/core";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Button from "@material-ui/core/Button";
import CenteredLoader from "../UtilityComponents/CenteredLoader";

const useStyles = makeStyles({
   filesContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
   },
   cardRoot: {
      width: "25%",
      width: "360px",
      height: "350px",
      margin: "30px",
      background: "#555",
   },
});

function WorkspaceFileTab({ User, activeProject, tab }) {
   const classes = useStyles();

   const [filesData, setFilesData] = useState(null);
   const [isLoading, setIsLoading] = useState(false);

   useEffect(() => {
      if (tab !== "projectfiles") return;

      async function getProjectFiles() {
         let abortFetch = new AbortController();

         setIsLoading(true);
         try {
            let responseStream = await fetch(
               `/api/project/drive/files/get/${activeProject}`,
               {
                  credentials: "include",
                  signal: abortFetch.signal,
               }
            );

            if (abortFetch.signal.aborted) return;

            let response = await responseStream.json();

            console.log(response);

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
   }, [tab]);

   return tab === "projectfiles" ? (
      <div className={classes.filesContainer}>
         <>
            {isLoading ? (
               <CenteredLoader color="primary" backdrop={false} />
            ) : filesData ? (
               filesData.map(file => (
                  <Card className={classes.cardRoot}>
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
                           <Typography variant="h5" component="h2" gutterBottom>
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
                     </CardActions>
                  </Card>
               ))
            ) : null}
         </>
      </div>
   ) : null;
}

export default WorkspaceFileTab;
