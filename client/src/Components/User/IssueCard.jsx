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
   descriptionContent: {
      wordBreak: "break-word",
      overflow: "hidden",
      backgroundColor: "darkgray",
      display: "flex",
      justifyContent: "center",
      padding: 0,
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

   const editorRef = useRef();

   const history = useHistory();

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

      try {
         const putOptions = {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               Issue_id: issue._id,
            }),
         };

         const updateStream = await fetch("/api/issue/close", putOptions);

         const updateData = await updateStream.json();

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
      } catch (error) {
         console.log(error);
      }
   }

   async function reopenIssue() {
      if (User.UniqueUsername !== issue.Creator.UniqueUsername) return;

      try {
         const putOptions = {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               Issue_id: issue._id,
            }),
         };

         const updateStream = await fetch("/api/issue/reopen", putOptions);

         const updateData = await updateStream.json();

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
      } catch (error) {
         console.log(error);
      }
   }

   async function deleteIssue() {
      if (User.UniqueUsername !== issue.Creator.UniqueUsername) return;

      try {
         const deleteOptions = {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               Issue_id: issue._id,
               Project_id: issue.Project_id,
            }),
         };

         const deleteResponseStream = await fetch(
            "/api/issue/delete",
            deleteOptions
         );
         const deleteData = await deleteResponseStream.json();

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
      } catch (error) {
         console.log(error);
      }
   }

   async function bookmarkIssue() {
      if (userBookmarked) return;

      try {
         const body = {
            User_id: User._id,
            User_UniqueUsername: User.UniqueUsername,
            Issue_id: issue._id,
            IssueTitle: issue.IssueTitle,
         };

         const putOptions = {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
         };

         const bookmarkDataStream = await fetch(
            "/api/issue/bookmark",
            putOptions
         );
         const bookmarkData = await bookmarkDataStream.json();

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
      } catch (error) {
         console.log(error);
      }
   }

   async function removeBookmark() {
      if (!userBookmarked) return;

      try {
         const body = {
            User_id: User._id,
            User_UniqueUsername: User.UniqueUsername,
            Issue_id: issue._id,
         };

         const putOptions = {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
         };

         const responseStream = await fetch(
            "/api/issue/bookmark/remove",
            putOptions
         );
         const bookmarkData = await responseStream.json();

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
      } catch (error) {
         console.log(error);
      }
   }

   return (
      <div className={classes.container}>
         <Card className={classes.root}>
            <CardHeader
               avatar={
                  <Avatar className={classes.avatar}>
                     <img
                        className={classes["profile-image"]}
                        src={`/api/profile/profile-image/${issue.Creator.UniqueUsername}`}
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
               <CardContent className={classes.descriptionContent}>
                  <SunEditor
                     ref={editorRef}
                     {...readonly_editor_config.props}
                     setOptions={readonly_editor_config.options}
                     setContents={description}
                     setDefaultStyle="background: darkgray; font-size: 20px; user-select: text; border: none; outline: none;"
                  />
               </CardContent>
            </Collapse>
         </Card>
      </div>
   );
}

export default IssueCard;
