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
import DeleteIcon from "@material-ui/icons/Delete";
import { readonly_editor_config } from "../../config/editor_config";
import formatDate from "../../utils/formatDate";
import "suneditor/dist/css/suneditor.min.css";
import "../../styles/solution-card.css";

const useStyles = makeStyles(theme => ({
   root: {
      width: "100%",
      background: "darkgray",
   },
   media: {
      background: "darkgray",
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
   "background-color: darkgray; color: black; font-size: 20px; border: none; outline: none; user-select: text; min-height: 100px; max-height: 300px";

function SolutionCard({ solution, User, issueDetails, pageHash }) {
   const classes = useStyles();
   const [solutionContent, setSolutionContent] = useState("");
   const [liked, setLiked] = useState(false);

   const editorRef = useRef();
   const solutionCardRef = useRef();

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

   useEffect(() => {
      if (!pageHash) return;

      if (pageHash === solution._id)
         solutionCardRef.current.scrollIntoView({ behavior: "smooth" });
   }, [pageHash, solution._id]);

   async function handleSolutionInteraction() {
      let body = {
         user_id: User._id,
         solution_id: solution._id,
         solution_creator: solution.SolutionCreator,
         issueTitle: issueDetails.IssueTitle,
         issueId: issueDetails._id,
      };

      try {
         const postOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
         };

         const liked = solution.LikedBy.some(like => {
            return like.UniqueUsername === User.UniqueUsername;
         });

         const endpoint = liked ? "remove-like" : "add-like";

         await fetch(`/api/issue/solution/${endpoint}`, postOptions);
      } catch (error) {
         console.log(error);
         return;
      }
   }

   async function deleteSolution() {
      try {
         const deleteOptions = {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
         };

         const responseStream = await fetch(
            `/api/issue/solution/delete/${solution._id}`,
            deleteOptions
         );
         const response = await responseStream.json();

         if (response.status === "error") throw response.error;

         console.log(response);
      } catch (error) {
         console.log(error);
      }
   }

   return (
      <div ref={solutionCardRef} className="solution-card-container">
         <Card className={classes.root}>
            <CardHeader
               avatar={
                  <Avatar className={classes.avatar}>
                     <img
                        className={classes["profile-image"]}
                        src={`/api/profile/profile-image/${solution.SolutionCreator}`}
                        alt=""
                     />
                  </Avatar>
               }
               action={
                  <>
                     {solution.SolutionCreator === User.UniqueUsername ? (
                        <IconButton onClick={deleteSolution}>
                           <DeleteIcon />
                        </IconButton>
                     ) : null}
                  </>
               }
               title={solution.SolutionCreator}
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
