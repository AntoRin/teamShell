import { useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
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
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
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

function IssueCard({
   User,
   issue,
   showContent,
   setActionStatus,
   redirectOnDelete = false,
}) {
   const classes = useStyles();
   const [expanded, setExpanded] = useState(showContent);
   const [description, setDescription] = useState("");
   const [anchorEl, setAnchorEl] = useState(null);
   const [userBookmarked, setUserBookmarked] = useState(false);
   const [creatorProfileImage, setCreatorProfileImage] = useState(null);

   const editorRef = useRef();

   const history = useHistory();

   useEffect(() => {
      async function getProfileImage() {
         try {
            let responseStream = await fetch(
               `/api/profile/profile-image/${issue.Creator.UniqueUsername}`
            );
            let response = await responseStream.json();

            if (response.status === "ok" && response.data)
               return setCreatorProfileImage(response.data);
            else if (response.status === "error") throw response.error;
         } catch (error) {
            console.log(error);
            return;
         }
      }

      getProfileImage();
   }, [issue.Creator.UniqueUsername]);

   useEffect(() => {
      if (editorRef.current) {
         setDescription(
            editorRef.current.editor.util.HTMLDecoder(issue.IssueDescription)
         );
      }
   }, [expanded, issue.IssueDescription]);

   useEffect(() => {
      let bookmarked = User.Issues.Bookmarked.find(
         bookmark => bookmark._id === issue._id
      );
      bookmarked ? setUserBookmarked(true) : setUserBookmarked(false);
   }, [User.Issues.Bookmarked, issue._id]);

   function handleExpandClick() {
      setExpanded(prev => !prev);
   }

   function handleMoreIconClick(event) {
      setAnchorEl(event.currentTarget);
   }

   function handleMoreOptionsClose() {
      setAnchorEl(null);
   }

   async function closeIssue() {
      if (User.UniqueUsername !== issue.Creator.UniqueUsername) return;

      let putOptions = {
         method: "PUT",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
            Issue_id: issue._id,
         }),
      };

      let updateStream = await fetch("/api/issue/close", putOptions);

      let updateData = await updateStream.json();

      if (updateData.status === "ok") {
         setActionStatus({
            type: "info",
            info: "Issue closed",
         });
      } else
         setActionStatus({
            type: "error",
            info: "There was an error closing the issue",
         });
   }

   async function reopenIssue() {
      if (User.UniqueUsername !== issue.Creator.UniqueUsername) return;

      let putOptions = {
         method: "PUT",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
            Issue_id: issue._id,
         }),
      };

      let updateStream = await fetch("/api/issue/reopen", putOptions);

      let updateData = await updateStream.json();

      if (updateData.status === "ok") {
         setActionStatus({
            type: "info",
            info: "Issue reopened",
         });
      } else
         setActionStatus({
            type: "error",
            info: "There was an error reopening the issue",
         });
   }

   async function deleteIssue() {
      if (User.UniqueUsername !== issue.Creator.UniqueUsername) return;

      let deleteOptions = {
         method: "DELETE",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
            Issue_id: issue._id,
            Project_id: issue.Project_id,
         }),
         credentials: "include",
      };

      let deleteResponseStream = await fetch(
         "/api/issue/delete",
         deleteOptions
      );
      let deleteData = await deleteResponseStream.json();

      if (deleteData.status === "ok") {
         if (redirectOnDelete === true) {
            history.push("/user/environment");
            return;
         }
         setActionStatus({
            type: "success",
            info: "Issue successfully deleted",
         });
      } else
         setActionStatus({
            type: "error",
            info: "There was an error deleting the issue",
         });
   }

   async function bookmarkIssue() {
      if (userBookmarked) return;
      let body = {
         User_id: User._id,
         User_UniqueUsername: User.UniqueUsername,
         Issue_id: issue._id,
         IssueTitle: issue.IssueTitle,
      };

      let putOptions = {
         method: "PUT",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(body),
      };

      let bookmarkDataStream = await fetch("/api/issue/bookmark", putOptions);
      let bookmarkData = await bookmarkDataStream.json();

      if (bookmarkData.status === "ok") {
         setActionStatus({
            type: "info",
            info: "Issue bookmarked",
         });
         setUserBookmarked(true);
      } else
         setActionStatus({
            type: "error",
            info: "There was an error saving the issue",
         });
   }

   async function removeBookmark() {
      if (!userBookmarked) return;
      let body = {
         User_id: User._id,
         User_UniqueUsername: User.UniqueUsername,
         Issue_id: issue._id,
      };

      let putOptions = {
         method: "PUT",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(body),
      };

      let bookmarkDataStream = await fetch(
         "/api/issue/bookmark/remove",
         putOptions
      );
      let bookmarkData = await bookmarkDataStream.json();

      if (bookmarkData.status === "ok") {
         setActionStatus({
            type: "info",
            info: "Bookmark removed",
         });
         setUserBookmarked(false);
      } else
         setActionStatus({
            type: "error",
            info: "There was an error removing the bookmark",
         });
   }

   return (
      <div className={classes.container}>
         <Card className={classes.root}>
            <CardHeader
               avatar={
                  <Avatar className={classes.avatar}>
                     <img
                        className={classes["profile-image"]}
                        src={
                           creatorProfileImage
                              ? creatorProfileImage.startsWith("https://")
                                 ? creatorProfileImage
                                 : `data:image/jpeg;base64,${creatorProfileImage}`
                              : "/assets/UserIcon.png"
                        }
                        alt=""
                     />
                  </Avatar>
               }
               action={
                  <div>
                     <IconButton
                        onClick={handleMoreIconClick}
                        aria-label="settings"
                     >
                        <MoreVertIcon />
                     </IconButton>
                     <Menu
                        anchorEl={anchorEl}
                        keepMounted
                        open={Boolean(anchorEl)}
                        onClose={handleMoreOptionsClose}
                     >
                        {User.UniqueUsername ===
                        issue.Creator.UniqueUsername ? (
                           issue.Active ? (
                              <MenuItem onClick={closeIssue}>
                                 Close Issue
                              </MenuItem>
                           ) : (
                              <MenuItem onClick={reopenIssue}>
                                 Reopen Issue
                              </MenuItem>
                           )
                        ) : null}
                        {userBookmarked ? (
                           <MenuItem onClick={removeBookmark}>
                              Remove Bookmark
                           </MenuItem>
                        ) : (
                           <MenuItem onClick={bookmarkIssue}>Bookmark</MenuItem>
                        )}
                        {User.UniqueUsername ===
                           issue.Creator.UniqueUsername && (
                           <MenuItem onClick={deleteIssue}>Delete</MenuItem>
                        )}
                     </Menu>
                  </div>
               }
               title={
                  <Link to={`/user/profile/${issue.Creator.UniqueUsername}`}>
                     {issue.Creator.UniqueUsername}
                  </Link>
               }
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
