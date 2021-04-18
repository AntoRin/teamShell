import { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import SolutionCard from "./SolutionCard";
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
}));

function IssueCard({ issue }) {
   const classes = useStyles();
   const [expanded, setExpanded] = useState(false);
   const [isLoading, setIsLoading] = useState(true);
   const [issueCreator, setIssueCreator] = useState("");

   useEffect(() => {
      async function getIssueCreatorDetails() {
         let userRequest = await fetch(
            `http://localhost:5000/profile/details/${issue.Creator}`,
            {
               credentials: "include",
            }
         );
         let userResponse = await userRequest.json();

         if (userResponse.status === "ok") {
            setIssueCreator(userResponse.user);
            setIsLoading(false);
         } else {
            setIssueCreator("");
            setIsLoading(true);
         }
      }
      getIssueCreatorDetails();
   }, [issue.Creator]);

   function handleExpandClick() {
      setExpanded(prev => !prev);
   }

   function issueDescriptionTruncate() {
      if (issue.IssueDescription.length > 40)
         return issue.IssueDescription.substring(0, 40) + "...";
      else return issue.IssueDescription;
   }

   return !isLoading ? (
      <div className="issue-card-container">
         <Card className={classes.root}>
            <CardHeader
               avatar={
                  <Avatar aria-label="recipe" className={classes.avatar}>
                     <img
                        className={classes["profile-image"]}
                        src={issueCreator.ProfileImage}
                        alt=""
                     />
                  </Avatar>
               }
               action={
                  <IconButton aria-label="settings">
                     <MoreVertIcon />
                  </IconButton>
               }
               title={issue.Creator}
               subheader={issue.createdAt}
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
                  <Typography paragraph>{issue.IssueDescription}</Typography>
               </CardContent>
            </Collapse>
         </Card>
         <SolutionCard issue={issue} />
      </div>
   ) : (
      <h1>Loading...</h1>
   );
}

export default IssueCard;
