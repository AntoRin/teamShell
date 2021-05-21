import { Container } from "@material-ui/core";
import ProjectGeneralDetails from "./ProjectGeneralDetails";
import IssuesInfoCard from "./IssuesInfoCard";
import ProjectMembersInfo from "./ProjectMembersInfo";

function ProjectTabPanel({ tabName, Project }) {
   switch (tabName) {
      case "General Details":
         return <ProjectGeneralDetails Project={Project} />;
      case "Issues":
         return (
            <Container>
               {Project.Issues.map(issue => (
                  <IssuesInfoCard key={issue._id} Issue={issue} />
               ))}
            </Container>
         );
      case "Members":
         return (
            <Container>
               <ProjectMembersInfo Project={Project} />
            </Container>
         );
      default:
         return <h1>Not found</h1>;
   }
}

export default ProjectTabPanel;
