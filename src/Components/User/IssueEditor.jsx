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
   },
});

function IssueEditor() {
   const classes = useStyles();
   const [issueInputs, setIssueInputs] = useState({
      issueTitleInput: "",
      issueBodyInput: "",
   });

   function handleChange(event) {
      setIssueInputs({
         ...issueInputs,
         [event.id]: event.target.value,
      });
   }

   return (
      <div className="issue-editor-container">
         <form id="issueEditorForm" autoComplete="off">
            <div className="issue-title">
               <input
                  value={issueInputs.title}
                  onChange={handleChange}
                  type="text"
                  id="issueTitleInput"
                  placeholder="Issue Title"
               />
            </div>
            <div className="issue-body">
               <textarea
                  value={issueInputs.title}
                  onChange={handleChange}
                  placeholder="State your issue"
                  id="issueBodyInput"
                  rows="7"
               ></textarea>
            </div>
            <Button
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
