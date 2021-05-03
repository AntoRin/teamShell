import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import SunEditor from "suneditor-react";
import { makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import Collapse from "@material-ui/core/Collapse";
import Avatar from "@material-ui/core/Avatar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import { red } from "@material-ui/core/colors";
import ShareIcon from "@material-ui/icons/Share";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import { readonly_editor_config } from "../../config/editor_config";
import formatDate from "../../utils/formatDate";
import "suneditor/dist/css/suneditor.min.css";

const useStyles = makeStyles(theme => ({
   container: {
      width: "100%",
   },
   root: {
      width: "100%",
      margin: "20px 0px",
      backgroundColor: "darkgray",
   },
   media: {
      margin: "30px 25px",
      maxWidth: "fit-content",
   },
   expand: {
      transform: "rotate(0deg)",
      marginLeft: "auto",
      transition: theme.transitions.create("transform", {
         duration: theme.transitions.duration.shortest,
      }),
   },
   expandOpen: {
      transform: "rotate(180deg)",
   },
   avatar: {
      backgroundColor: red[500],
      width: "40px",
      height: "40px",
   },
   "profile-image": {
      width: "40px",
      height: "40px",
      borderRadius: "50%",
   },
   "description-content": {
      wordBreak: "break-word",
      overflow: "hidden",
      backgroundColor: "transparent",
      display: "flex",
      justifyContent: "center",
   },
}));

function IssueCard({ issue, showContent }) {
   const classes = useStyles();
   const [expanded, setExpanded] = useState(showContent);
   const [description, setDescription] = useState("");

   const editorRef = useRef();

   useEffect(() => {
      if (editorRef.current) {
         setDescription(
            editorRef.current.editor.util.HTMLDecoder(issue.IssueDescription)
         );
      }
   }, [expanded, issue.IssueDescription]);

   function handleExpandClick() {
      setExpanded(prev => !prev);
   }

   return (
      <div className={classes.container}>
         <Card className={classes.root}>
            <CardHeader
               avatar={
                  <Avatar className={classes.avatar}>
                     <img
                        className={classes["profile-image"]}
                        src={issue.Creator.ProfileImage}
                        alt=""
                     />
                  </Avatar>
               }
               action={
                  <IconButton aria-label="settings">
                     <MoreVertIcon />
                  </IconButton>
               }
               title={issue.Creator.UniqueUsername}
               subheader={formatDate(issue.createdAt)}
            />
            <CardMedia className={classes.media}>
               <Link className="issue-header-link" to={`/issue/${issue._id}`}>
                  <Typography variant="h3" component="h3">
                     {issue.IssueTitle}
                  </Typography>
               </Link>
            </CardMedia>
            <CardActions disableSpacing>
               <IconButton aria-label="share">
                  <ShareIcon />
               </IconButton>
               {!showContent && (
                  <IconButton
                     className={clsx(classes.expand, {
                        [classes.expandOpen]: expanded,
                     })}
                     onClick={handleExpandClick}
                     aria-expanded={expanded}
                     aria-label="show more"
                  >
                     <ExpandMoreIcon />
                  </IconButton>
               )}
            </CardActions>
            <Collapse in={expanded} timeout="auto" unmountOnExit>
               <CardContent className={classes["description-content"]}>
                  <SunEditor
                     ref={editorRef}
                     {...readonly_editor_config.props}
                     setOptions={readonly_editor_config.options}
                     setContents={description}
                  />
               </CardContent>
            </Collapse>
         </Card>
      </div>
   );
}

export default IssueCard;
