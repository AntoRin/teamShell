import { Link } from "react-router-dom";
import DetailCard from "./DetailCard";

function ProfileOrgTab({ Profile }) {
   return (
      <>
         <div className="orgs-tab-list">
            {Profile.Organizations.map((org, index) => {
               return (
                  <Link
                     key={index}
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
