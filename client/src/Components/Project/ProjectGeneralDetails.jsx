import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Avatar from "@material-ui/core/Avatar";
import Chip from "@material-ui/core/Chip";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import CodeIcon from "@material-ui/icons/Code";
import DescriptionIcon from "@material-ui/icons/Description";
import WbIncandescentIcon from "@material-ui/icons/WbIncandescent";
import BugReportIcon from "@material-ui/icons/BugReport";
import PeopleAltIcon from "@material-ui/icons/PeopleAlt";
import EventIcon from "@material-ui/icons/Event";
import { Divider } from "@material-ui/core";
import formatDate from "../../utils/formatDate";

const useStyles = makeStyles({
   userChip: {
      "& .MuiChip-label": {
         fontSize: "1.3rem",
         padding: "20px",
      },
   },
   listIcon: {
      color: "rgb(108, 98, 190)",
   },
   divider: {
      "&.MuiDivider-root": {
         background: "rgb(51, 0, 111, 0.5)",
      },
   },
});

const commonTypographicProps = variant => ({
   variant,
   color: "inherit",
   gutterBottom: true,
});

function ProjectGeneralDetails({ Project }) {
   const classes = useStyles();

   const history = useHistory();

   function goToProfile(username) {
      history.push(`/user/profile/${username}`);
   }

   return (
      <Container>
         <List className={classes.icons}>
            <ListItem className={classes.listElement} divider={false}>
               <ListItemIcon>
                  <CodeIcon fontSize="large" className={classes.listIcon} />
               </ListItemIcon>
               <ListItemText
                  primary={Project.ProjectName}
                  primaryTypographyProps={commonTypographicProps("h5")}
               />
            </ListItem>
            <Divider variant="middle" className={classes.divider} />
            <ListItem className={classes.listElement}>
               <ListItemIcon>
                  <DescriptionIcon
                     fontSize="large"
                     className={classes.listIcon}
                  />
               </ListItemIcon>
               <ListItemText
                  primary={Project.ProjectDescription}
                  primaryTypographyProps={commonTypographicProps("h6")}
               />
            </ListItem>
            <Divider variant="middle" className={classes.divider} />
            <ListItem className={classes.listElement}>
               <ListItemIcon>
                  <WbIncandescentIcon
                     fontSize="large"
                     className={classes.listIcon}
                  />
               </ListItemIcon>
               <ListItemText
                  primary="Created by: "
                  primaryTypographyProps={{
                     ...commonTypographicProps("h6"),
                     component: "div",
                  }}
                  secondary={
                     <Chip
                        className={classes.userChip}
                        clickable={true}
                        onClick={() => goToProfile(Project.Creator)}
                        variant="outlined"
                        label={Project.Creator}
                        color="primary"
                        size="medium"
                        avatar={<Avatar>{Project.Creator[0]}</Avatar>}
                     />
                  }
                  secondaryTypographyProps={{ component: "div" }}
               />
            </ListItem>
            <Divider variant="middle" className={classes.divider} />
            <ListItem className={classes.listElement}>
               <ListItemIcon>
                  <BugReportIcon
                     fontSize="large"
                     className={classes.listIcon}
                  />
               </ListItemIcon>
               <ListItemText
                  primary="No. of Issues: "
                  primaryTypographyProps={commonTypographicProps("h6")}
                  secondary={0 || Project.IssuesRef.length}
                  secondaryTypographyProps={commonTypographicProps("h6")}
               />
            </ListItem>
            <Divider variant="middle" className={classes.divider} />
            <ListItem className={classes.listElement}>
               <ListItemIcon>
                  <PeopleAltIcon
                     fontSize="large"
                     className={classes.listIcon}
                  />
               </ListItemIcon>
               <ListItemText
                  primary="Members: "
                  primaryTypographyProps={commonTypographicProps("h6")}
                  secondary={Project.Members.length}
                  secondaryTypographyProps={commonTypographicProps("h6")}
               />
            </ListItem>
            <Divider variant="middle" className={classes.divider} />
            <ListItem className={classes.listElement}>
               <ListItemIcon>
                  <EventIcon fontSize="large" className={classes.listIcon} />
               </ListItemIcon>
               <ListItemText
                  primary="Created at: "
                  primaryTypographyProps={commonTypographicProps("h6")}
                  secondary={formatDate(Project.createdAt)}
                  secondaryTypographyProps={commonTypographicProps("h6")}
               />
            </ListItem>
            <Divider variant="middle" className={classes.divider} />
         </List>
      </Container>
   );
}

export default ProjectGeneralDetails;
