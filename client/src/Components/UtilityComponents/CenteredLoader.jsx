import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
   backdrop: {
      zIndex: theme.zIndex.drawer + 1,
      color: "#fff",
      width: "100p%",
      height: "100%",
   },
   xyCentered: {
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
   },
}));

function CenteredLoader({ color, backdrop }) {
   const classes = useStyles();

   return backdrop ? (
      <Backdrop className={classes.backdrop} open={true}>
         <CircularProgress color={color} />
      </Backdrop>
   ) : (
      <div className={classes.xyCentered}>
         <CircularProgress color={color} />
      </div>
   );
}

export default CenteredLoader;
