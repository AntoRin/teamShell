import { makeStyles } from "@material-ui/core/styles";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import IssueEditor from "./IssueEditor";
import "../../styles/environment-panel.css";

const useStyles = makeStyles(theme => ({
   root: {
      width: "100%",
      backgroundColor: "#222",
   },
   heading: {
      fontSize: theme.typography.pxToRem(20),
      fontWeight: theme.typography.fontWeightBold,
      color: "red",
      fontFamily: `"Poppins", "sans-serif"`,
   },
   arrowIcon: {
      color: "white",
   },
}));

function EnvironmentPanel({ User, currentOrg }) {
   const classes = useStyles();

   function currentProjects() {
      if (User.Projects.length < 1)
         return (
            <div className="panel-project-member">
               <h3>No projects yet</h3>
            </div>
         );

      let thisOrgProjects = User.Projects.find(
         project => project.ParentOrganization === currentOrg
      );

      if (!thisOrgProjects)
         return (
            <div className="panel-project-member">
               <h3>You have no projects in this organization</h3>
            </div>
         );

      let projectTitles = User.Projects.map((project, index) => {
         return (
            project.ParentOrganization === currentOrg && (
               <div key={index} className="panel-project-member">
                  <h3>{project.ProjectName}</h3>
               </div>
            )
         );
      });
      return projectTitles;
   }
   return (
      <div className="environment-panel-container">
         <div className="environment-panel-main">
            <div className="panel-project-selection">{currentProjects()}</div>
            <div className="environment-workspace">
               <div className="new-issue-division">
                  <Accordion className={classes.root}>
                     <AccordionSummary
                        expandIcon={
                           <ExpandMoreIcon className={classes.arrowIcon} />
                        }
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                     >
                        <Typography className={classes.heading}>
                           Create a new issue
                        </Typography>
                     </AccordionSummary>
                     <AccordionDetails>
                        <IssueEditor />
                     </AccordionDetails>
                  </Accordion>
               </div>
            </div>
         </div>
      </div>
   );
}

export default EnvironmentPanel;
