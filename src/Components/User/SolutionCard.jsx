import { useState } from "react";
import { Editor, EditorState } from "draft-js";
import "draft-js/dist/Draft.css";
import "../../styles/text-editor.css";

function SolutionCard({ issue }) {
   const [editorState, setEditorState] = useState(() =>
      EditorState.createEmpty()
   );

   return (
      <div className="solution-editor-container">
         <Editor
            editorState={editorState}
            onChange={setEditorState}
            spellCheck={true}
         />
      </div>
   );
}

export default SolutionCard;
