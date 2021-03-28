import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import GlobalNav from "../GlobalNav";
import DetailCard from "./DetailCard";
import "../../user-profile.css";

function UserProfile({ location, match, User }) {
   const [Profile, setProfile] = useState({});
   const [isLoading, setIsLoading] = useState(true);
   const [query, setQuery] = useState("");

   //-------------------------Change fetch methods--------------------------------

   useEffect(() => {
      async function getProfile() {
         if (match.params.UniqueUsername === User.UniqueUsername) {
            setProfile(User);
            setIsLoading(false);
         } else {
            let userRequest = await fetch(
               `http://localhost:5000/profile/${match.params.UniqueUsername}`,
               { credentials: "include" }
            );
            let profile = await userRequest.json();
            setProfile(profile);
            setIsLoading(false);
         }
      }
      getProfile();
   }, [User, match.params.UniqueUsername]);

   useEffect(() => {
      let queryString = location.search;
      if (queryString) {
         let [queryKey, queryValue] = queryString.split("?")[1].split("=");
         queryKey === "tab" && setQuery(queryValue);
      } else {
         setQuery("");
      }
   }, [location]);

   function tabComponent() {
      if (query === "") {
         return (
            <>
               <div className="profile-unique-name">
                  <DetailCard
                     header="Unique Username"
                     detail={Profile.UniqueUsername}
                  />
               </div>
               <div className="profile-username">
                  <DetailCard
                     header="Username"
                     detail={Profile.Username || "None"}
                  />
               </div>
               <div className="profile-email">
                  <DetailCard header="Email" detail={Profile.Email} />
               </div>
               <div className="profile-createdat">
                  <DetailCard
                     header="Account Created At"
                     detail={Profile.createdAt}
                  />
               </div>
            </>
         );
      } else if (query === "organizations") {
         return <h1>Organization Tab</h1>;
      } else if (query === "projects") {
         return <h1>Projects Tab</h1>;
      } else if (query === "issues") {
         return <h1>Issues Tab</h1>;
      }
   }

   if (isLoading) {
      return <h1>Loading...</h1>;
   } else {
      return (
         <div className="profile-container">
            <GlobalNav
               profileImage={User.ProfileImage}
               UniqueUsername={User.UniqueUsername}
            />
            <div className="profile-tabs">
               <div className="user-tab tab-link">
                  <Link
                     to={location => ({
                        ...location,
                        search: "",
                     })}
                  >
                     User
                  </Link>
               </div>
               <div className="organization-tab tab-link">
                  <Link
                     to={location => ({
                        ...location,
                        search: "?tab=organizations",
                     })}
                  >
                     Organizations
                  </Link>
               </div>
               <div className="project-tab tab-link">
                  <Link
                     to={location => ({
                        ...location,
                        search: "?tab=projects",
                     })}
                  >
                     Projects
                  </Link>
               </div>
               <div className="issue-tab tab-link">
                  <Link
                     to={location => ({
                        ...location,
                        search: "?tab=issues",
                     })}
                  >
                     Issues
                  </Link>
               </div>
            </div>
            <div className="profile-contents">
               <div className="profile-picture-section">
                  <img
                     id="profilePictureBig"
                     src={Profile.ProfileImage}
                     alt=""
                  />
                  <div className="profile-picture-caption">
                     <i>@{Profile.UniqueUsername}</i>
                  </div>
                  <div className="profile-edit">
                     <button id="profileEditBtn">Edit Profile</button>
                  </div>
               </div>
               <div className="profile-details-section">{tabComponent()}</div>
            </div>
         </div>
      );
   }
}

export default UserProfile;
