import { useState } from "react";
import Button from "@material-ui/core/Button";
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos";
import { makeStyles } from "@material-ui/core/styles";
import "../../styles/issue-editor.css";

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
   const [issueInputs, setIssueInputs] = useState({
      issueTitleInput: "",
      issueBodyInput: "",
   });

   function handleChange(event) {
      setIssueInputs({
         ...issueInputs,
         [event.target.id]: event.target.value,
      });
   }

   async function handleIssueCreation(event) {
      event.preventDefault();

      let project_id = User.Projects.find(
         project => project.ProjectName === activeProject
      );

      if (!project_id) return;

      let body = {
         IssueTitle: issueInputs.issueTitleInput,
         IssueDescription: issueInputs.issueBodyInput,
         ProjectContext: activeProject,
         project_id,
         Creator: User.UniqueUsername,
      };

      let postOptions = {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(body),
         credentials: "include",
      };

      let newIssueRequest = await fetch(
         "http://localhost:5000/issue/create",
         postOptions
      );
      let newIssueResponse = await newIssueRequest.json();

      if (newIssueResponse.status === "ok") {
         setIssueInputs({
            issueTitleInput: "",
            issueBodyInput: "",
         });
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
                  value={issueInputs.issueTitleInput}
                  onChange={handleChange}
                  type="text"
                  id="issueTitleInput"
                  required
                  placeholder="Issue Title"
               />
            </div>
            <div className="issue-body">
               <textarea
                  value={issueInputs.issueBodyInput}
                  onChange={handleChange}
                  placeholder="State your issue"
                  id="issueBodyInput"
                  required
                  rows="7"
               ></textarea>
            </div>
            <Button
               type="submit"
               className={classes.root}
               size="medium"
               variant="contained"
               color="default"
               endIcon={<ArrowForwardIosIcon />}
            >
               Create
            </Button>
         </form>
      </div>
   );
}

export default IssueEditor;
