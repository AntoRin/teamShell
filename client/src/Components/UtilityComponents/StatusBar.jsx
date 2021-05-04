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

function StatusBar({ actionStatus, setActionStatus, statusType }) {
   const classes = useStyles();

   const [snackbarOpen, setSnackbarOpen] = useState(false);

   useEffect(() => {
      setSnackbarOpen(true);
   }, [actionStatus, setActionStatus]);

   function handleSnackbarClose(event, reason) {
      if (reason === "clickaway") {
         return;
      }

      setSnackbarOpen(false);
      setActionStatus(null);
   }

   return (
      <div className={classes.root}>
         <Snackbar
            open={snackbarOpen}
            autoHideDuration={5000}
            onClose={handleSnackbarClose}
         >
            <Alert onClose={handleSnackbarClose} severity={statusType}>
               {actionStatus}
            </Alert>
         </Snackbar>
      </div>
   );
}

export default StatusBar;
