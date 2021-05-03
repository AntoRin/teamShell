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

function StatusBar({ error, setError }) {
   const classes = useStyles();

   const [snackbarOpen, setSnackbarOpen] = useState(false);

   useEffect(() => {
      if (error) {
         setSnackbarOpen(true);
      }
   }, [error, setError]);

   function handleSnackbarClose(event, reason) {
      if (reason === "clickaway") {
         return;
      }

      setSnackbarOpen(false);
      setError(null);
   }

   return (
      <div className={classes.root}>
         <Snackbar
            open={snackbarOpen}
            autoHideDuration={5000}
            onClose={handleSnackbarClose}
         >
            <Alert onClose={handleSnackbarClose} severity="error">
               {error}
            </Alert>
         </Snackbar>
      </div>
   );
}

export default StatusBar;
