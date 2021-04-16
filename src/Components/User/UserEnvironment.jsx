import { useState } from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import GlobalNav from "../GlobalNav";

TabPanel.propTypes = {
   children: PropTypes.node,
   index: PropTypes.any.isRequired,
   value: PropTypes.any.isRequired,
};

function TabPanel(props) {
   const { children, value, index, ...other } = props;

   return (
      <div
         role="tabpanel"
         hidden={value !== index}
         id={`scrollable-auto-tabpanel-${index}`}
         aria-labelledby={`scrollable-auto-tab-${index}`}
         {...other}
      >
         {value === index && (
            <Box p={3}>
               <Typography>{children}</Typography>
            </Box>
         )}
      </div>
   );
}

function createTabProps(index) {
   return {
      id: `scrollable-auto-tab-${index}`,
      "aria-controls": `scrollable-auto-tabpanel-${index}`,
   };
}

const useStyles = makeStyles(theme => ({
   root: {
      flexGrow: 1,
      width: "100%",
      backgroundColor: "#111",
   },
   "app-bar": {
      backgroundColor: "#222",
   },
   tab: {
      color: "cyan",
      fontWeight: 700,
      textTransform: "none",
      fontSize: "1.2rem",
   },
}));

function UserEnvironment({ User }) {
   const classes = useStyles();
   const [value, setValue] = useState(0);
   const [currentOrg, setCurrentOrg] = useState(
      User.Organizations[0].OrganizationName
   );
   console.log(currentOrg);
   function handleChange(event, newValue) {
      setValue(newValue);
      setCurrentOrg(User.Organizations[newValue].OrganizationName);
   }

   return (
      <div className="user-environment-container">
         <GlobalNav
            ProfileImage={User.ProfileImage}
            UniqueUsername={User.UniqueUsername}
         />
         <div className="environment-toolbar">
            <div className={classes.root}>
               <AppBar
                  className={classes["app-bar"]}
                  position="static"
                  color="default"
               >
                  <Tabs
                     value={value}
                     onChange={handleChange}
                     indicatorColor="primary"
                     textColor="secondary"
                     variant="scrollable"
                     scrollButtons="auto"
                     aria-label="scrollable tab"
                  >
                     {User.Organizations.map((org, index) => {
                        return (
                           <Tab
                              className={classes.tab}
                              key={index}
                              label={org.OrganizationName}
                              {...createTabProps(index)}
                           />
                        );
                     })}
                  </Tabs>
               </AppBar>
               {User.Projects.map((project, index) => {
                  console.log(project.ParentOrganization === currentOrg);
                  return project.ParentOrganization === currentOrg ? (
                     <TabPanel key={index} value={value} index={index}>
                        {project.ProjectName}
                     </TabPanel>
                  ) : (
                     ""
                  );
               })}
               {/* <TabPanel value={value} index={0}>
                  Item Oneasdasdasd
               </TabPanel>
               <TabPanel value={value} index={1}>
                  Item Two
               </TabPanel>
               <TabPanel value={value} index={2}>
                  Item Three
               </TabPanel>
               <TabPanel value={value} index={3}>
                  Item Four
               </TabPanel>
               <TabPanel value={value} index={4}>
                  Item Five
               </TabPanel>
               <TabPanel value={value} index={5}>
                  Item Six
               </TabPanel>
               <TabPanel value={value} index={6}>
                  Item Seven
               </TabPanel> */}
            </div>
         </div>
      </div>
   );
}

export default UserEnvironment;
