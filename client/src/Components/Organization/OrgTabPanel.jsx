import Container from "@material-ui/core/Container";
import OrgGeneralDetails from "./OrgGeneralDetails";
import ProjectInfoCard from "./ProjectInfoCard";
import OrgMembersInfo from "./OrgMembersInfo";

function OrgTabPanel({ tabName, Organization }) {
   switch (tabName) {
      case "General Details":
         return <OrgGeneralDetails Organization={Organization} />;
      case "Projects":
         return (
            <Container>
               {Organization.Projects.map(project => (
                  <ProjectInfoCard
                     key={project}
                     project={project}
                     organization={Organization.OrganizationName}
                  />
               ))}
            </Container>
         );
      case "Members":
         return (
            <Container>
               <OrgMembersInfo Organization={Organization} />
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
