import { useState, useEffect, useRef } from "react";
import SunEditor from "suneditor-react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardMedia from "@material-ui/core/CardMedia";
import CardActions from "@material-ui/core/CardActions";
import Avatar from "@material-ui/core/Avatar";
import IconButton from "@material-ui/core/IconButton";
import { red } from "@material-ui/core/colors";
import FavoriteIcon from "@material-ui/icons/Favorite";
import ShareIcon from "@material-ui/icons/Share";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import { readonly_editor_config } from "../../config/editor_config";
import formatDate from "../../utils/formatDate";
import "suneditor/dist/css/suneditor.min.css";
import "../../styles/solution-card.css";

const useStyles = makeStyles(theme => ({
   root: {
      width: "100%",
      background: "#fff",
   },
   media: {
      background: "#333",
   },
   expand: {
      transform: "rotate(0deg)",
      marginLeft: "auto",
      transition: theme.transitions.create("transform", {
         duration: theme.transitions.duration.shortest,
      }),
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
   red: {
      color: "red",
   },
}));

const editorDefaultStyles =
   "background-color: #fff; color: black; font-size: 18px; border: none; outline: none; user-select: text; min-height: 100px; max-height: 300px";

function SolutionCard({ solution, User, issueDetails }) {
   const classes = useStyles();
   const [solutionContent, setSolutionContent] = useState("");
   const [liked, setLiked] = useState(false);

   const editorRef = useRef();

   useEffect(() => {
      setSolutionContent(
         editorRef.current.editor.util.HTMLDecoder(solution.SolutionBody)
      );
   }, [solution]);

   useEffect(() => {
      let userLike = solution.LikedBy.some(like => {
         return like.UniqueUsername === User.UniqueUsername;
      });

      userLike ? setLiked(true) : setLiked(false);
   }, [solution.LikedBy, User]);

   async function handleSolutionInteraction() {
      let body = {
         user_id: User._id,
         solution_id: solution._id,
         solution_creator: solution.SolutionCreator.UniqueUsername,
         initiator: User.UniqueUsername,
         recipient: solution.SolutionCreator.UniqueUsername,
         metaData: {
            notification_type: "NewSolutionLike",
            info_type: "New like",
            target_category: "Solution",
            target_name: issueDetails.IssueTitle,
            target_info: "",
            initiator_opinion: "liked",
         },
      };

      try {
         let postOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
         };

         let liked = solution.LikedBy.some(like => {
            return like.UniqueUsername === User.UniqueUsername;
         });

         let endpoint = liked ? "remove-like" : "add-like";

         await fetch(`/api/issue/solution/${endpoint}`, postOptions);
      } catch (error) {
         console.log(error);
         return;
      }
   }

   return (
      <div className="solution-card-container">
         <Card className={classes.root}>
            <CardHeader
               avatar={
                  <Avatar className={classes.avatar}>
                     <img
                        className={classes["profile-image"]}
                        src={`/api/profile/profile-image/${solution.SolutionCreator.UniqueUsername}`}
                        alt=""
                     />
                  </Avatar>
               }
               action={
                  <IconButton aria-label="settings">
                     <MoreVertIcon />
                  </IconButton>
               }
               title={solution.SolutionCreator.UniqueUsername}
               subheader={formatDate(solution.createdAt)}
            />
            <CardMedia
               className={classes.media}
               children={
                  <SunEditor
                     ref={editorRef}
                     {...readonly_editor_config.props}
                     setOptions={readonly_editor_config.options}
                     setContents={solutionContent}
                     setDefaultStyle={editorDefaultStyles}
                  />
               }
            />
            {solution.LikedBy.length > 0 && (
               <div className="liked-by-section">
                  <span>
                     <Typography color="secondary" variant="body1">
                        Liked by :
                     </Typography>
                  </span>
                  {solution.LikedBy.map(like => (
                     <span key={like._id}>
                        <Typography variant="body1">
                           {like.UniqueUsername},
                        </Typography>
                     </span>
                  ))}
               </div>
            )}
            <CardActions disableSpacing>
               <IconButton
                  className={liked ? classes.red : ""}
                  onClick={handleSolutionInteraction}
                  aria-label="Like the solution"
               >
                  <FavoriteIcon />
               </IconButton>
               <IconButton aria-label="share">
                  <ShareIcon />
               </IconButton>
            </CardActions>
         </Card>
      </div>
   );
}

export default SolutionCard;
