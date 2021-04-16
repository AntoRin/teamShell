import { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import "../../styles/environment-panel.css";

const useStyles = makeStyles(theme => ({
   root: {
      "& .MuiTextField-root": {},
      backgroundColor: "darkgray",
      border: "2px solid lightblue",
      padding: "10px",
   },
}));

function EnvironmentPanel({ User, currentOrg }) {
   const classes = useStyles();
   const [editorValue, setEditorValue] = useState("");

   function handleEditorChange(event) {
      setEditorValue(event.target.value);
   }

   function currentProjects() {
      if (User.Projects.length < 1)
         return (
            <div className="panel-project-member">
               <h3>No projects yet</h3>
            </div>
         );

      let thisOrgProjects = User.Projects.find(
         project => project.ParentOrganization === currentOrg
      );

      if (!thisOrgProjects)
         return (
            <div className="panel-project-member">
               <h3>You have no projects in this organization</h3>
            </div>
         );

      let projectTitles = User.Projects.map((project, index) => {
         return (
            project.ParentOrganization === currentOrg && (
               <div key={index} className="panel-project-member">
                  <h3>{project.ProjectName}</h3>
               </div>
            )
         );
      });
      return projectTitles;
   }
   return (
      <div className="environment-panel-container">
         <div className="environment-panel-main">
            <div className="panel-project-selection">{currentProjects()}</div>
            <div className="environment-workspace">
               <div className={classes.root}>
                  <TextField
                     id="multilineEditor"
                     color="secondary"
                     margin="normal"
                     size="medium"
                     label="New Issue"
                     multiline
                     placeholder="Create a new issue"
                     rows={4}
                     variant="standard"
                     fullWidth={true}
                     value={editorValue}
                     onChange={handleEditorChange}
                  />
               </div>
            </div>
         </div>
      </div>
   );
}

export default EnvironmentPanel;
