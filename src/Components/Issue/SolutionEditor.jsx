import { useState, useEffect, useRef } from "react";
import SunEditor, { buttonList } from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css";
import "../../styles/text-editor.css";

const editorConfig = {
   width: "100%",
   height: "100",
   minHeight: "500px",
   stickyToolbar: true,
   overflow: "scroll",
   defaultStyle: "font-size: 18px",
   buttonList: [
      ["font", "fontSize", "formatBlock"],
      ["blockquote"],
      ["bold", "underline", "italic", "strike", "subscript", "superscript"],
      ["fontColor"],
      ["removeFormat"],
      ["outdent", "indent"],
      ["align", "horizontalRule", "list", "lineHeight"],
      ["link", "image"],
      ["fullScreen"],
   ],
};

function SolutionCard({ issue }) {
   const editorRef = useRef();

   useEffect(() => {
      console.log(editorRef.current.editor.core);
   }, []);

   return (
      <div className="solution-editor-container">
         <SunEditor ref={editorRef} setOptions={editorConfig} />
      </div>
   );
}

export default SolutionCard;
