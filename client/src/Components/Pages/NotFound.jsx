import { useHistory } from "react-router";
import { makeStyles } from "@material-ui/styles";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";

const useStyles = makeStyles({
   centered: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      width: "100%",
      height: "100vh",
   },
});

function NotFound({ navHeight }) {
   const classes = useStyles(navHeight);

   const history = useHistory();

   function goToHome() {
      history.goBack();
   }

   return (
      <div className={classes.centered}>
         <Typography variant="h2" component="div" color="initial">
            404
         </Typography>
         <Typography variant="h2" component="div" color="initial">
            NOT FOUND
         </Typography>
         <Button variant="contained" size="large" onClick={goToHome}>
            Back
         </Button>
      </div>
   );
}

export default NotFound;
