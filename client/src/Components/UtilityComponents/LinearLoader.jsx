import LinearProgress from "@material-ui/core/LinearProgress";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
   root: {
      "& > * + *": {
         marginTop: theme.spacing(2),
      },
      position: "fixed",
      top: 0,
      right: 0,
      left: 0,
      "& .MuiLinearProgress-bar": {
         backgroundColor: "rgb(51, 0, 111)",
      },
   },
}));

function LinearLoader() {
   const classes = useStyles();

   return (
      <div className={classes.root}>
         <LinearProgress />
      </div>
   );
}

export default LinearLoader;
