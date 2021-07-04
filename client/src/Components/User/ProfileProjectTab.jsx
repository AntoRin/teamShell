import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/styles";
import DetailCard from "./DetailCard";

const useStyles = makeStyles({
   projectTabList: {
      "& a": {
         textDecoration: "none",
         color: "#fff",
      },
      "& .detail-card-container:hover": {
         backgroundColor: "rgb(21, 21, 29)",
      },
   },
});

function ProfileProjectTab({ Profile }) {
   const classes = useStyles();

   return (
      <>
         <div className={classes.projectTabList}>
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
