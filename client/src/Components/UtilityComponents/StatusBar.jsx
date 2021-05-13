import { useState, useEffect } from "react";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
   root: {
      width: "100%",
      "& > * + *": {
         marginTop: theme.spacing(2),
      },
   },
}));

function Alert(props) {
   return <MuiAlert elevation={6} variant="filled" {...props} />;
}

function StatusBar({ actionStatus, setActionStatus }) {
   const classes = useStyles();

   const [snackbarOpen, setSnackbarOpen] = useState(false);

   useEffect(() => {
      setSnackbarOpen(true);

      return () => setActionStatus({ info: null, type: "success" });
   }, [actionStatus, setActionStatus]);

   function handleSnackbarClose(event, reason) {
      if (reason === "clickaway") {
         return;
      }

      setActionStatus({ info: null, type: "success" });
      setSnackbarOpen(false);
   }

   return (
      <div className={classes.root}>
         <Snackbar
            open={snackbarOpen}
            autoHideDuration={3000}
            onClose={handleSnackbarClose}
         >
            <Alert onClose={handleSnackbarClose} severity={actionStatus.type}>
               {actionStatus.info}
            </Alert>
         </Snackbar>
      </div>
   );
}

export default StatusBar;
