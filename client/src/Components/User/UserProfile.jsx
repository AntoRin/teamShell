import { useState, useEffect, useRef } from "react";
import { Link, useHistory } from "react-router-dom";
import Typography from "@material-ui/core/Typography";
import { Button } from "@material-ui/core";
import DetailCard from "./DetailCard";
import LinearLoader from "../UtilityComponents/LinearLoader";
import "../../styles/user-profile.css";

function UserProfile({ location, match, User }) {
   const [Profile, setProfile] = useState({});
   const [owner, setOwner] = useState(false);
   const [isLoading, setIsLoading] = useState(true);
   const [query, setQuery] = useState("");

   const bioElement = useRef();
   const usernameElement = useRef();

   const fileInputElement = useRef();

   const history = useHistory();

   useEffect(() => {
      async function getProfile() {
         if (match.params.UniqueUsername === User.UniqueUsername) {
            setProfile(User);
            setOwner(true);
            setIsLoading(false);
         } else {
            let userRequest = await fetch(
               `/profile/details/${match.params.UniqueUsername}`,
               { credentials: "include" }
            );
            let profile = await userRequest.json();
            setProfile(profile.user);
            setOwner(false);
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

   function goToUpdate() {
      let updateTab = location.pathname + "?tab=update";
      history.push(updateTab);
   }

   async function handleImageUpload(event) {
      event.preventDefault();
      let form = event.target;
      let image = fileInputElement.current.files[0];
      let imageData = new FormData(form);
      imageData.append("profileImage", image);

      let postOptions = {
         method: "POST",
         body: imageData,
         credentials: "include",
      };

      let uploadStream = await fetch(
         "/profile/uploads/profile-image",
         postOptions
      );

      let uploadResponse = await uploadStream.json();

      console.log(uploadResponse);
   }

   async function handleProfileUpdate(event) {
      event.preventDefault();
      let newBio = bioElement.current.value;
      let newName = usernameElement.current.value;
      let body = { Bio: newBio, Username: newName };

      let updateOptions = {
         method: "PUT",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(body),
         credentials: "include",
      };
      let updateRequest = await fetch("/profile/edit", updateOptions);
      let updateResponse = await updateRequest.json();
      if (updateResponse.status === "ok")
         window.location.href = window.location.origin + location.pathname;
   }

   function handleCancelUpdate() {
      history.push(location.pathname);
   }

   function tabComponent() {
      if (query === "") {
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
         return (
            <>
               <div className="orgs-tab-list">
                  {Profile.Organizations.map((org, index) => {
                     return (
                        <Link
                           key={index}
                           to={`/organization/${org.OrganizationName}`}
                        >
                           <DetailCard
                              header={org.OrganizationName}
                              detail=""
                           />
                        </Link>
                     );
                  })}
               </div>
            </>
         );
      } else if (query === "projects") {
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
      } else if (query === "issues") {
         return (
            <>
               <div className="issues-tab-list">
                  {Profile.Issues.Created.map((issue, index) => {
                     return (
                        <DetailCard
                           key={index}
                           header={issue.IssueTitle}
                           detail=""
                        />
                     );
                  })}
               </div>
            </>
         );
      } else if (query === "update") {
         if (!owner) {
            return <h1>😑</h1>;
         } else {
            return (
               <div className="profile-edit-section">
                  <form
                     id="profileImageUploadForm"
                     encType="multipart/form-data"
                     onSubmit={handleImageUpload}
                  >
                     <div className="upload-image">
                        <Typography variant="h5">
                           Upload a new profile image
                        </Typography>
                        <input
                           ref={fileInputElement}
                           type="file"
                           id="profileImage"
                           required
                        />
                        <Button
                           variant="outlined"
                           type="submit"
                           color="primary"
                        >
                           Upload
                        </Button>
                     </div>
                  </form>
                  <form id="profileEditForm" onSubmit={handleProfileUpdate}>
                     <div className="edit-bio">
                        <label htmlFor="bioEdit">Add a bio</label> <br />
                        <textarea
                           ref={bioElement}
                           autoComplete="off"
                           id="bioEdit"
                           maxLength="300"
                           rows="7"
                           required
                        ></textarea>
                     </div>
                     <div className="edit-name">
                        <label htmlFor="nameEdit">Username</label> <br />
                        <input
                           ref={usernameElement}
                           autoComplete="off"
                           type="text"
                           id="nameEdit"
                           required
                        />
                     </div>
                     <div className="submit-edition">
                        <button
                           type="button"
                           className="form-action-btn dull"
                           id="cancelEditsBtn"
                           onClick={handleCancelUpdate}
                        >
                           Cancel
                        </button>
                        <button
                           className="form-action-btn bright"
                           id="saveEditsBtn"
                           type="submit"
                        >
                           Save
                        </button>
                     </div>
                  </form>
               </div>
            );
         }
      }
   }

   if (isLoading) {
      return <LinearLoader />;
   } else {
      return (
         <div className="profile-container">
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
                     src={
                        Profile.ProfileImage.startsWith("https://")
                           ? Profile.ProfileImage
                           : `data:image/jpeg;base64,${Profile.ProfileImage}`
                     }
                     alt=""
                  />
                  <div className="profile-picture-caption">
                     <strong>@{Profile.UniqueUsername}</strong>
                  </div>
                  {owner && (
                     <div className="profile-edit">
                        <button onClick={goToUpdate} id="profileEditBtn">
                           Edit Profile
                        </button>
                     </div>
                  )}
               </div>
               <div className="profile-details-section">{tabComponent()}</div>
            </div>
         </div>
      );
   }
}

export default UserProfile;
