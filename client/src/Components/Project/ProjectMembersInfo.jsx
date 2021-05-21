import React from "react";
import { useHistory } from "react-router";
import { Divider, makeStyles } from "@material-ui/core";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemText from "@material-ui/core/ListItemText";
import PersonIcon from "@material-ui/icons/Person";

const useStyles = makeStyles({
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

function ProjectMembersInfo({ Project }) {
   const classes = useStyles();

   const history = useHistory();

   function goToProfile(member) {
      history.push(`/user/profile/${member}`);
   }

   return (
      <List>
         {Project.Members.map(member => {
            return (
               <React.Fragment key={member}>
                  <ListItem button={true} onClick={() => goToProfile(member)}>
                     <ListItemAvatar>
                        <PersonIcon fontSize="large" color="primary" />
                     </ListItemAvatar>
                     <ListItemText
                        primary={member}
                        primaryTypographyProps={commonTypographicProps("h6")}
                     />
                  </ListItem>
                  <Divider className={classes.divider} variant="inset" />
               </React.Fragment>
            );
         })}
      </List>
   );
}

export default ProjectMembersInfo;
