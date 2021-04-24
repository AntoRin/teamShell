import { useRef } from "react";
import SunEditor from "suneditor-react";
import { solution_editor_config } from "../../config/editor_config";
import "suneditor/dist/css/suneditor.min.css";
import "../../styles/text-editor.css";

function SolutionCard({ issue }) {
   const editorRef = useRef();

   return (
      <div className="solution-editor-container">
         <SunEditor
            ref={editorRef}
            setOptions={solution_editor_config.options}
         />
      </div>
   );
}

export default SolutionCard;
