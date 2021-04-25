import { useRef } from "react";
import SunEditor from "suneditor-react";
import { solution_editor_config } from "../../config/editor_config";
import "suneditor/dist/css/suneditor.min.css";
import "../../styles/solution-editor.css";

function SolutionCard({ issue }) {
   const editorRef = useRef();

   return (
      <div className="solution-editor-container">
         <SunEditor
            ref={editorRef}
            setOptions={solution_editor_config.options}
         />
         <div className="solution-submit-btn">
            <button className="form-action-btn bright">Submit</button>
         </div>
      </div>
   );
}

export default SolutionCard;
