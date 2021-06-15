import { Link } from "react-router-dom";
import DetailCard from "./DetailCard";

function ProfileProjectTab({ Profile }) {
   return (
      <>
         <div className="projects-tab-list">
            {Profile.Projects.map((project, index) => {
               return (
                  <Link
                     to={`/project/${project.ParentOrganization}/${project.ProjectName}`}
                     key={index}
                  >
                     <DetailCard header={project.ProjectName} detail="" />
                  </Link>
               );
            })}
         </div>
      </>
   );
}

export default ProfileProjectTab;
