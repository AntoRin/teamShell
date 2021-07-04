import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/core";
import DetailCard from "./DetailCard";

const useStyles = makeStyles({
   orgTabList: {
      "& a": {
         textDecoration: "none",
         color: "#fff",
      },
      "& .detail-card-container:hover": {
         backgroundColor: "rgb(21, 21, 29)",
      },
   },
});

function ProfileOrgTab({ Profile }) {
   const classes = useStyles();

   return (
      <>
         <div className={classes.orgTabList}>
            {Profile.Organizations.map(org => {
               return (
                  <Link
                     key={org._id}
                     to={`/organization/${org.OrganizationName}`}
                  >
                     <DetailCard header={org.OrganizationName} detail="" />
                  </Link>
               );
            })}
         </div>
      </>
   );
}

export default ProfileOrgTab;
