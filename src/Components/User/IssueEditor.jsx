import { useState, useRef } from "react";
import SunEditor from "suneditor-react";
import Button from "@material-ui/core/Button";
import AddBoxSharpIcon from "@material-ui/icons/AddBoxSharp";
import { makeStyles } from "@material-ui/core/styles";
import { issue_editor_config } from "../../config/editor_config";
import "../../styles/issue-editor.css";
import "suneditor/dist/css/suneditor.min.css";

const useStyles = makeStyles({
   root: {
      "& .MuiButton-label": {
         fontSize: "1.1rem",
         textTransform: "none",
         fontFamily: `"Quicksand", "sans-serif"`,
         fontWeight: 700,
      },
      position: "relative",
      left: "50%",
      transform: "translateX(-50%)",
      margin: "5px",
   },
});

function IssueEditor({ activeProject, User }) {
   const classes = useStyles();
   const [issueTitle, setIssueTitle] = useState("");

   const editorRef = useRef();

   function handleChange(event) {
      setIssueTitle(event.target.value);
   }

   async function handleIssueCreation(event) {
      event.preventDefault();

      let Project_id = User.Projects.find(
         project => project.ProjectName === activeProject
      );

      if (!Project_id) return;

      let IssueDescriptionRaw = editorRef.current.editor.core.getContents();

      let IssueDescription = editorRef.current.editor.util.HTMLEncoder(
         IssueDescriptionRaw
      );

      let body = {
         IssueTitle: issueTitle,
         IssueDescription,
         ProjectContext: activeProject,
         Project_id,
         Creator: {
            UniqueUsername: User.UniqueUsername,
            User_id: User._id,
            ProfileImage: User.ProfileImage,
         },
      };

      let postOptions = {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(body),
         credentials: "include",
      };

      let newIssueSubmit = await fetch(
         "http://localhost:5000/issue/create",
         postOptions
      );
      let newIssueResponse = await newIssueSubmit.json();
      console.log(newIssueResponse);
      if (newIssueResponse.status === "ok") {
         setIssueTitle("");
         editorRef.current.editor.core.setContents("");
      }
   }

   return (
      <div className="issue-editor-container">
         <form
            onSubmit={handleIssueCreation}
            id="issueEditorForm"
            autoComplete="off"
         >
            <div className="issue-title">
               <input
                  value={issueTitle}
                  onChange={handleChange}
                  type="text"
                  id="issueTitleInput"
                  required
                  placeholder="Issue Title"
               />
            </div>
            <div className="issue-body">
               <SunEditor
                  ref={editorRef}
                  setOptions={issue_editor_config.options}
               />
            </div>
            <Button
               type="submit"
               className={classes.root}
               size="medium"
               variant="contained"
               color="default"
               endIcon={<AddBoxSharpIcon fontSize="large" />}
            >
               Create
            </Button>
         </form>
      </div>
   );
}

export default IssueEditor;
