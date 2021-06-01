import React from "react";
import {
   Divider,
   List,
   ListItem,
   ListItemText,
   makeStyles,
} from "@material-ui/core";

const useStyles = makeStyles({
   createRoomContainer: {
      display: "grid",
      gridTemplateColumns: "3fr 1fr",
      height: "100%",
   },
   projectMemberList: {
      height: "100%",
      "& .MuiList-root": {
         backgroundColor: "rgb(25, 20, 30)",
         height: "100%",
      },
      margin: "10px",
   },
   divider: {
      "&.MuiDivider-root": {
         background: "rgb(51, 0, 111, 0.5)",
      },
   },
});

function WorkspaceCreateRoomTab({ projectDetails }) {
   const classes = useStyles();

   return (
      <div className={classes.createRoomContainer}>
         <div></div>
         <div className={classes.projectMemberList}>
            <List>
               {projectDetails.Members &&
                  projectDetails.Members.map(member => (
                     <React.Fragment key={member}>
                        <ListItem button>
                           <ListItemText primary={member} />
                        </ListItem>
                        <Divider className={classes.divider} />
                     </React.Fragment>
                  ))}
            </List>
         </div>
      </div>
   );
}

export default WorkspaceCreateRoomTab;
