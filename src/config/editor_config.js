export const issue_editor_config = {
   options: {
      width: "100%",
      height: "100",
      minHeight: "300px",
      stickyToolbar: true,
      resizingBar: false,
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
   },
};

export const solution_editor_config = {
   options: {
      width: "100%",
      minHeight: "100px",
      height: "300px",
      stickyToolbar: true,
      resizingBar: false,
      defaultStyle: "font-size: 18px",
      buttonList: [
         ["font", "fontSize", "formatBlock"],
         ["blockquote"],
         ["bold", "underline", "italic", "strike", "subscript", "superscript"],
         ["removeFormat"],
         ["align", "horizontalRule", "list", "lineHeight"],
         ["link", "image"],
         ["fullScreen"],
      ],
   },
};

export const readonly_editor_config = {
   props: {
      disable: true,
      enableToolbar: false,
      showToolbar: false,
   },
   options: {
      width: "100%",
      maxWidth: "100%",
      minHeight: "200px",
      height: "fit-content",
      resizingBar: false,
      overflow: "scroll",
      defaultStyle: "font-size: 18px",
   },
};
