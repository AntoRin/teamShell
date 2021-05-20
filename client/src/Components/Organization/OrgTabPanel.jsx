import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Avatar from "@material-ui/core/Avatar";
import Chip from "@material-ui/core/Chip";
import Container from "@material-ui/core/Container";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import EcoIcon from "@material-ui/icons/Eco";
import DescriptionIcon from "@material-ui/icons/Description";
import WbIncandescentIcon from "@material-ui/icons/WbIncandescent";
import AssignmentIcon from "@material-ui/icons/Assignment";
import PeopleAltIcon from "@material-ui/icons/PeopleAlt";
import formatDate from "../../utils/formatDate";
import EventIcon from "@material-ui/icons/Event";
import { Divider } from "@material-ui/core";

const useStyles = makeStyles({
   panel: {
      height: "100vh",
   },
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
         background: "#33006F",
      },
   },
});

const commonTypographicProps = variant => ({
   variant,
   color: "inherit",
   gutterBottom: true,
});

function OrgTabPanel({ tabName, Organization }) {
   const classes = useStyles();

   const history = useHistory();

   function goToProfile(username) {
      history.push(`/user/profile/${username}`);
   }

   switch (tabName) {
      case "General Details":
         return (
            <Container>
               <List className={classes.icons}>
                  <ListItem className={classes.listElement} divider={false}>
                     <ListItemIcon>
                        <EcoIcon
                           fontSize="large"
                           className={classes.listIcon}
                        />
                     </ListItemIcon>
                     <ListItemText
                        primary={Organization.OrganizationName}
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
                        primary={Organization.Description}
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
                              onClick={() => goToProfile(Organization.Creator)}
                              variant="outlined"
                              label={Organization.Creator}
                              color="primary"
                              size="medium"
                              avatar={
                                 <Avatar>{Organization.Creator[0]}</Avatar>
                              }
                           />
                        }
                        secondaryTypographyProps={{ component: "div" }}
                     />
                  </ListItem>
                  <Divider variant="middle" className={classes.divider} />
                  <ListItem className={classes.listElement}>
                     <ListItemIcon>
                        <AssignmentIcon
                           fontSize="large"
                           className={classes.listIcon}
                        />
                     </ListItemIcon>
                     <ListItemText
                        primary="No. of projects: "
                        primaryTypographyProps={commonTypographicProps("h6")}
                        secondary={0 || Organization.Projects.length}
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
                        secondary={Organization.Members.length}
                        secondaryTypographyProps={commonTypographicProps("h6")}
                     />
                  </ListItem>
                  <Divider variant="middle" className={classes.divider} />
                  <ListItem className={classes.listElement}>
                     <ListItemIcon>
                        <EventIcon
                           fontSize="large"
                           className={classes.listIcon}
                        />
                     </ListItemIcon>
                     <ListItemText
                        primary="Created at: "
                        primaryTypographyProps={commonTypographicProps("h6")}
                        secondary={formatDate(Organization.createdAt)}
                        secondaryTypographyProps={commonTypographicProps("h6")}
                     />
                  </ListItem>
                  <Divider variant="middle" className={classes.divider} />
               </List>
            </Container>
         );
      case "Projects":
         return (
            <Container>
               <h1>{tabName}</h1>
            </Container>
         );
      case "Members":
         return (
            <Container>
               <h1>{tabName}</h1>
            </Container>
         );
      default:
         return (
            <Container>
               <h1>Not found</h1>
            </Container>
         );
   }
}

export default OrgTabPanel;
