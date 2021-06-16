import { makeStyles } from "@material-ui/styles";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles({
   centered: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      width: "100%",
      height: navHeight => `calc(100vh - ${navHeight}px)`,
   },
});

function NotFound({ navHeight }) {
   const classes = useStyles(navHeight);

   return (
      <div className={classes.centered}>
         <Typography variant="h2" component="div" color="initial">
            404
         </Typography>
         <Typography variant="h2" component="div" color="initial">
            NOT FOUND
         </Typography>
      </div>
   );
}

export default NotFound;
