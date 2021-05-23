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

      let userInActiveProject = User.Projects.find(
         project => project.ProjectName === activeProject
      );

      let Project_id = userInActiveProject._id;

      if (!Project_id) return;

      try {
         let IssueDescriptionRaw = editorRef.current.editor.core.getContents();

         let IssueDescription =
            editorRef.current.editor.util.HTMLEncoder(IssueDescriptionRaw);

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
            initiator: {
               UniqueUsername: User.UniqueUsername,
               ProfileImage: User.ProfileImage,
            },
            recipient: activeProject,
            metaData: {
               notification_type: "NewIssue",
               target_category: "Issue",
               target_name: issueTitle,
               target_info: "",
            },
         };

         let postOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            credentials: "include",
         };

         let newIssueSubmit = await fetch("/api/issue/create", postOptions);
         let newIssueResponse = await newIssueSubmit.json();

         if (newIssueResponse.status === "ok") {
            setIssueTitle("");
            editorRef.current.editor.core.setContents("");
         }
      } catch (error) {
         console.log(error);
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
