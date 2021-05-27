import LinearProgress from "@material-ui/core/LinearProgress";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
   root: {
      width: "100%",
      "& > * + *": {
         marginTop: theme.spacing(2),
      },
      position: "fixed",
      top: 0,
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
