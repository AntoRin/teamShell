import { useState, useEffect, useRef, useContext } from "react";
import { Link, useHistory } from "react-router-dom";
import Typography from "@material-ui/core/Typography";
import { Button } from "@material-ui/core";
import { ButtonGroup } from "@material-ui/core";
import { SocketInstance } from "../UtilityComponents/ProtectedRoute";
import { GlobalActionStatus } from "../App";
import DetailCard from "./DetailCard";
import LinearLoader from "../UtilityComponents/LinearLoader";
import "../../styles/user-profile.css";

function UserProfile({ location, match, User, setChatSettings }) {
   const [Profile, setProfile] = useState({});
   const [owner, setOwner] = useState(false);
   const [isLoading, setIsLoading] = useState(true);
   const [isValid, setIsValid] = useState(false);
   const [query, setQuery] = useState("");
   const [issueTabType, setIssueTabType] = useState("created");

   const bioElement = useRef();
   const usernameElement = useRef();
   const fileInputElement = useRef();

   const socket = useContext(SocketInstance);
   const setActionStatus = useContext(GlobalActionStatus);

   const history = useHistory();

   useEffect(() => {
      const abortFetch = new AbortController();

      async function getProfile(update = false) {
         try {
            if (match.params.UniqueUsername === User.UniqueUsername) {
               if (!update) {
                  setProfile(User);
                  setOwner(true);
                  setIsValid(true);
                  setIsLoading(false);
               } else {
                  setIsLoading(true);
                  let userDataStream = await fetch(
                     `/api/profile/details/${match.params.UniqueUsername}`,
                     { credentials: "include", signal: abortFetch.signal }
                  );

                  if (abortFetch.signal.aborted) return;

                  let profile = await userDataStream.json();
                  if (profile.status === "ok") {
                     setProfile(profile.user);
                     setIsValid(true);
                     setIsLoading(false);
                  } else {
                     setIsValid(false);
                     setIsLoading(false);
                  }
               }
            } else {
               let userDataStream = await fetch(
                  `/api/profile/details/${match.params.UniqueUsername}`,
                  { credentials: "include", signal: abortFetch.signal }
               );

               if (abortFetch.signal.aborted) return;

               let profile = await userDataStream.json();

               if (profile.status === "ok") {
                  setProfile(profile.user);
                  setOwner(false);
                  setIsValid(true);
                  setIsLoading(false);
               } else {
                  setIsValid(false);
                  setIsLoading(false);
               }
            }
         } catch (error) {
            console.log(error);
         }
      }
      getProfile();

      socket.on("user-data-change", () => getProfile(true));

      return () => {
         abortFetch.abort();
         socket.off("user-data-change");
      };
   }, [User, match.params.UniqueUsername, socket]);

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

   function handleIssuesTabFilter(event) {
      setIssueTabType(event.target.innerText.toLowerCase());
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
         "/api/profile/uploads/profile-image",
         postOptions
      );

      let uploadResponse = await uploadStream.json();

      uploadResponse.status === "ok"
         ? setActionStatus({ type: "success", info: "Profile Image updated" })
         : setActionStatus({ type: "error", info: uploadResponse.error });
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
      let updateRequest = await fetch("/api/profile/edit", updateOptions);
      let updateResponse = await updateRequest.json();
      updateResponse.status === "ok"
         ? setActionStatus({
              type: "success",
              info: "Profile successfully updated",
           })
         : setActionStatus({
              type: "error",
              info: "There was an error updating your profile",
           });
   }

   function initiateChat() {
      setChatSettings({
         open: true,
         recipient: Profile.UniqueUsername,
      });
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
         return owner ? (
            <>
               <div className="issues-tab-select">
                  <ButtonGroup>
                     <Button
                        onClick={handleIssuesTabFilter}
                        variant="outlined"
                        color="secondary"
                     >
                        Created
                     </Button>
                     <Button
                        onClick={handleIssuesTabFilter}
                        variant="outlined"
                        color="secondary"
                     >
                        Bookmarked
                     </Button>
                  </ButtonGroup>
               </div>
               {issueTabType === "created" && (
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
               )}
               {issueTabType === "bookmarked" && (
                  <div className="issues-tab-list">
                     {Profile.Issues.Bookmarked.map((issue, index) => {
                        return (
                           <DetailCard
                              key={index}
                              header={issue.IssueTitle}
                              detail=""
                           />
                        );
                     })}
                  </div>
               )}
            </>
         ) : (
            <Typography color="secondary" variant="h4">
               Issues are private
            </Typography>
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
      return isValid ? (
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
                     src={Profile.ProfileImage}
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
                  {!owner && (
                     <Button
                        onClick={initiateChat}
                        variant="outlined"
                        color="primary"
                     >
                        Message
                     </Button>
                  )}
               </div>
               <div className="profile-details-section">{tabComponent()}</div>
            </div>
         </div>
      ) : (
         <h1>There was an error</h1>
      );
   }
}

export default UserProfile;
