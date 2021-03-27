import GlobalNav from "../GlobalNav";

function UserHome({ User }) {
   return (
      <div>
         <div className="home-container">
            <GlobalNav profileImage={User.ProfileImage} />
         </div>
      </div>
   );
}

export default UserHome;
