import { useState } from "react";
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
import FavoriteIcon from "@material-ui/icons/Favorite";
import ShareIcon from "@material-ui/icons/Share";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import MoreVertIcon from "@material-ui/icons/MoreVert";

const useStyles = makeStyles(theme => ({
   root: {
      maxWidth: "100%",
      margin: "10px",
      backgroundColor: "darkgray",
   },
   media: {
      margin: "30px 25px",
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
   subtitle: {
      margin: "10px 25px",
      fontSize: "1.4rem",
      fontWeight: "600",
      fontFamily: `"Quicksand", "sans-serif"`,
      width: "75%",
   },
   description: {
      wordBreak: "break-word",
   },
}));

function IssueCard({ issue }) {
   const classes = useStyles();
   const [expanded, setExpanded] = useState(false);

   const formatDate = dateString =>
      new Date(Date.parse(issue.createdAt)).toLocaleString("en-US", {
         weekday: "short",
         day: "numeric",
         year: "numeric",
         month: "long",
         hour: "numeric",
         minute: "numeric",
      });

   function handleExpandClick() {
      setExpanded(prev => !prev);
   }

   function issueDescriptionTruncate() {
      if (issue.IssueDescription.length > 40)
         return issue.IssueDescription.substring(0, 40) + "...";
      else return issue.IssueDescription;
   }

   return (
      <div className="issue-card-container">
         <Card className={classes.root}>
            <CardHeader
               avatar={
                  <Avatar aria-label="recipe" className={classes.avatar}>
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
               <Typography variant="h3" component="h3">
                  {issue.IssueTitle}
               </Typography>
            </CardMedia>
            <CardContent>
               <Typography
                  className={classes.subtitle}
                  variant="body2"
                  color="textSecondary"
                  component="p"
               >
                  {issueDescriptionTruncate()}
               </Typography>
            </CardContent>
            <CardActions disableSpacing>
               <IconButton aria-label="add to favorites">
                  <FavoriteIcon />
               </IconButton>
               <IconButton aria-label="share">
                  <ShareIcon />
               </IconButton>
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
            </CardActions>
            <Collapse in={expanded} timeout="auto" unmountOnExit>
               <CardContent>
                  <Typography className={classes.description} paragraph>
                     {issue.IssueDescription}
                  </Typography>
               </CardContent>
            </Collapse>
         </Card>
      </div>
   );
}

export default IssueCard;
