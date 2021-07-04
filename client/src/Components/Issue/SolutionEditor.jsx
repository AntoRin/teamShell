import { useRef } from "react";
import SunEditor from "suneditor-react";
import { solution_editor_config } from "../../config/editor_config";
import "suneditor/dist/css/suneditor.min.css";
import "../../styles/solution-editor.css";
import { Button } from "@material-ui/core";

function SolutionEditor({ issueDetails, User }) {
   const editorRef = useRef();

   async function handleNewSolution(event) {
      event.preventDefault();

      if (!/[a-bA-B]/.test(editorRef.current.editor.getText().trim())) return;

      try {
         const solutionPlainText = editorRef.current.editor.core.getContents();

         const solutionEncoded =
            editorRef.current.editor.util.HTMLEncoder(solutionPlainText);

         const body = {
            Issue_id: issueDetails._id,
            Project_id: issueDetails.Project_id,
            SolutionBody: solutionEncoded,
         };

         const postOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
         };

         const newSolution = await fetch(
            "/api/issue/solution/create",
            postOptions
         );
         const solutionResponse = await newSolution.json();

         if (solutionResponse.status === "ok")
            editorRef.current.editor.core.setContents("");
      } catch (error) {
         console.error(error.message);
      }
   }

   return (
      <div className="solution-editor-container">
         <form onSubmit={handleNewSolution} id="solutionForm">
            <SunEditor
               ref={editorRef}
               setOptions={solution_editor_config.options}
               setDefaultStyle="background: darkgray; font-size: 20px; user-select: text; border: none; outline: none;"
            />
            <div className="solution-submit-btn">
               <Button variant="contained" type="submit">
                  Submit
               </Button>
            </div>
         </form>
      </div>
   );
}

export default SolutionEditor;
