import "../../styles/environment-panel.css";

function EnvironmentPanel({ User, currentOrg }) {
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
         </div>
      </div>
   );
}

export default EnvironmentPanel;
