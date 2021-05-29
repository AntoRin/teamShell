import { makeStyles } from "@material-ui/core";
import useRequest from "../Hooks/useRequest";

const useStyles = makeStyles({
   filesContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
   },
});

function WorkspaceFileTab({ User, activeProject, tab }) {
   const classes = useStyles();

   const files = useRequest(
      `api/project/drive/files/get/${activeProject}`,
      JSON.stringify({})
   );

   return tab === "projectfiles" ? (
      <div className={classes.filesContainer}>
         <></>
      </div>
   ) : null;
}

export default WorkspaceFileTab;
