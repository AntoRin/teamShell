import SunEditor from "suneditor-react";
import { readonly_editor_config } from "../../config/editor_config";
import "suneditor/dist/css/suneditor.min.css";

function SolutionCard({ solution }) {
   return (
      <SunEditor
         setDefaultStyle="background: #222; color: white"
         setContents={solution.SolutionBody}
         {...readonly_editor_config.props}
         setOptions={readonly_editor_config.options}
      />
   );
}

export default SolutionCard;
