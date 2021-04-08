import GlobalNav from "../GlobalNav";
import "../../project-home.css";

function ProjectHome({ User }) {
   return (
      <div className="project-home-container">
         <GlobalNav
            ProfileImage={User.ProfileImage}
            UniqueUsername={User.UniqueUsername}
         />
      </div>
   );
}

export default ProjectHome;
