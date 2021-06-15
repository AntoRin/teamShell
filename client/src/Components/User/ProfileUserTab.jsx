import DetailCard from "./DetailCard";
import formatDate from "../../utils/formatDate";

function ProfileUserTab({ Profile }) {
   return (
      <>
         <div className="profile-bio">
            <DetailCard header="Bio" detail={Profile.Bio} />
         </div>
         <div className="profile-unique-name">
            <DetailCard
               header="Unique Username"
               detail={Profile.UniqueUsername}
            />
         </div>
         <div className="profile-username">
            <DetailCard header="Username" detail={Profile.Username || "None"} />
         </div>
         <div className="profile-email">
            <DetailCard header="Email" detail={Profile.Email} />
         </div>
         <div className="profile-createdat">
            <DetailCard
               header="Account Created At"
               detail={formatDate(Profile.createdAt)}
            />
         </div>
      </>
   );
}

export default ProfileUserTab;
