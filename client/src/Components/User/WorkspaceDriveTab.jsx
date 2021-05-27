import { makeStyles } from "@material-ui/core";
import Button from "@material-ui/core/Button";

const useStyles = makeStyles({
   root: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
   },
});

async function authorizeDrive() {
   try {
      window.location.pathname = "/api/project/drive/google/authorize";
   } catch (error) {
      console.log(error);
      return;
   }
}

async function performDriveAction() {
   try {
      let responseStream = await fetch("/api/project/drive/google/list-files");
      let data = await responseStream.json();
      console.log(data);
   } catch (error) {
      console.log(error);
      return;
   }
}

function WorkspaceDriveTab({ tab }) {
   const classes = useStyles();

   return tab === "Drive" ? (
      <div className={classes.root}>
         <Button variant="contained" color="primary" onClick={authorizeDrive}>
            Create drive
         </Button>
         <Button
            variant="contained"
            color="primary"
            onClick={performDriveAction}
         >
            List drive files
         </Button>
      </div>
   ) : null;
}

export default WorkspaceDriveTab;
