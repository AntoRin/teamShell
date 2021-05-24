import { forwardRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import CloseIcon from "@material-ui/icons/Close";
import Slide from "@material-ui/core/Slide";
import StatusBar from "./StatusBar";

const useStyles = makeStyles(theme => ({
   appBar: {
      position: "relative",
   },
   title: {
      marginLeft: theme.spacing(2),
      flex: 1,
   },
   dialog: {
      "& .MuiDialog-paperFullScreen": {
         backgroundColor: "#B9D9EB",
      },
   },
}));

const Transition = forwardRef(function Transition(props, ref) {
   return <Slide direction="up" ref={ref} {...props} />;
});

function FullScreenDialog({
   children,
   isSettingsOpen,
   setIsSettingsOpen,
   actionStatus,
   setActionStatus,
}) {
   const classes = useStyles();

   function closeSettings() {
      setIsSettingsOpen(false);
   }

   return (
      <div>
         <Dialog
            className={classes.dialog}
            fullScreen
            open={isSettingsOpen}
            onClose={closeSettings}
            TransitionComponent={Transition}
         >
            <AppBar className={classes.appBar}>
               <Toolbar>
                  <IconButton
                     edge="start"
                     color="inherit"
                     onClick={closeSettings}
                     aria-label="close"
                  >
                     <CloseIcon />
                  </IconButton>
                  <Typography variant="h6" className={classes.title}>
                     Settings
                  </Typography>
                  <Button autoFocus color="inherit" onClick={closeSettings}>
                     save
                  </Button>
               </Toolbar>
            </AppBar>
            {children}
         </Dialog>
         {actionStatus.info && (
            <StatusBar
               actionStatus={actionStatus}
               setActionStatus={setActionStatus}
            />
         )}
      </div>
   );
}

export default FullScreenDialog;
