import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
   backdrop: {
      zIndex: theme.zIndex.drawer + 1,
      color: "#fff",
      width: "100%",
      height: "100%",
   },
   centered: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
   },
   loader: {
      color: "rgb(89, 9, 185)",
   },
}));

function CenteredLoader({ absolutelyPositioned = false }) {
   const classes = useStyles();

   return !absolutelyPositioned ? (
      <Backdrop className={classes.backdrop} open={true}>
         <CircularProgress color="primary" />
      </Backdrop>
   ) : (
      <div className={classes.centered}>
         <CircularProgress className={classes.loader} />
      </div>
   );
}

export default CenteredLoader;
