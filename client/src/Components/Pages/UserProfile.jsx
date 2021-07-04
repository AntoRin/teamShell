import { useState, useEffect, useRef, useContext } from "react";
import { Link, useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import NotFound from "./NotFound";
import { SocketInstance } from "../UtilityComponents/ProtectedRoute";
import { GlobalActionStatus } from "../App";
import LinearLoader from "../UtilityComponents/LinearLoader";
import ProfileUserTab from "../User/ProfileUserTab";
import ProfileOrgTab from "../User/ProfileOrgTab";
import ProfileProjectTab from "../User/ProfileProjectTab";
import ProfileIssueTab from "../User/ProfileIssueTab";
import ProfileUpdateTab from "../User/ProfileUpdateTab";
import parseQueryStrings from "../../utils/parseQueryStrings";
import "../../styles/user-profile.css";

const useStyles = makeStyles({
   profileContainer: {
      marginTop: navHeight => navHeight + 10,
      minHeight: navHeight => `calc(100vh - ${navHeight}px)`,
   },
   tabBtn: {
      color: "rgb(108, 98, 190)",
      border: "1px solid rgb(89, 9, 185)",
      fontWeight: "800",
   },
});

function UserProfile({ location, match, User, setChatSettings, navHeight }) {
   const classes = useStyles(navHeight);
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
                  const userDataStream = await fetch(
                     `/api/profile/details/${match.params.UniqueUsername}`,
                     { signal: abortFetch.signal }
                  );

                  if (abortFetch.signal.aborted) return;

                  const profile = await userDataStream.json();
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
               const userDataStream = await fetch(
                  `/api/profile/details/${match.params.UniqueUsername}`,
                  { signal: abortFetch.signal }
               );

               if (abortFetch.signal.aborted) return;

               const profile = await userDataStream.json();

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
      const queryString = location.search;

      if (queryString) {
         const queries = parseQueryStrings(queryString);
         queries.tab && setQuery(queries.tab);
      } else {
         setQuery("");
      }
   }, [location]);

   function goToUpdate() {
      const updateTab = location.pathname + "?tab=update";
      history.push(updateTab);
   }

   function handleIssuesTabFilter(tabName) {
      if (tabName) setIssueTabType(tabName.toLowerCase());
   }

   async function handleImageUpload(event) {
      event.preventDefault();

      try {
         const form = event.target;
         const image = fileInputElement.current.files[0];
         const imageData = new FormData(form);
         imageData.append("profileImage", image);

         const postOptions = {
            method: "POST",
            body: imageData,
         };

         const uploadStream = await fetch(
            "/api/profile/uploads/profile-image",
            postOptions
         );

         const uploadResponse = await uploadStream.json();

         uploadResponse.status === "ok"
            ? setActionStatus({
                 type: "success",
                 info: "Profile Image updated",
              })
            : setActionStatus({ type: "error", info: uploadResponse.error });
      } catch (error) {
         console.log(error);
      }
   }

   async function handleProfileUpdate(event) {
      event.preventDefault();

      try {
         const newBio = bioElement.current.value;
         const newName = usernameElement.current.value;
         const body = { Bio: newBio, Username: newName };

         const updateOptions = {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
         };
         const updateRequest = await fetch("/api/profile/edit", updateOptions);
         const updateResponse = await updateRequest.json();
         updateResponse.status === "ok"
            ? setActionStatus({
                 type: "success",
                 info: "Profile successfully updated",
              })
            : setActionStatus({
                 type: "error",
                 info: "There was an error updating your profile",
              });
      } catch (error) {
         console.log(error);
      }
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
         return <ProfileUserTab Profile={Profile} />;
      } else if (query === "organizations") {
         return <ProfileOrgTab Profile={Profile} />;
      } else if (query === "projects") {
         return <ProfileProjectTab Profile={Profile} />;
      } else if (query === "issues") {
         return (
            <ProfileIssueTab
               owner={owner}
               Profile={Profile}
               issueTabType={issueTabType}
               handleIssuesTabFilter={handleIssuesTabFilter}
            />
         );
      } else if (query === "update") {
         if (!owner) {
            return <h1>😑</h1>;
         } else {
            return (
               <ProfileUpdateTab
                  fileInputElement={fileInputElement}
                  handleImageUpload={handleImageUpload}
                  handleProfileUpdate={handleProfileUpdate}
                  bioElement={bioElement}
                  usernameElement={usernameElement}
                  handleCancelUpdate={handleCancelUpdate}
               />
            );
         }
      } else return <ProfileUserTab Profile={Profile} />;
   }

   if (isLoading) {
      return <LinearLoader />;
   } else {
      return isValid ? (
         <div className={classes.profileContainer}>
            <div className="profile-tabs">
               <div className="tab-link">
                  <Link
                     to={location => ({
                        ...location,
                        search: "",
                     })}
                  >
                     <Button
                        className={classes.tabBtn}
                        variant={
                           query === "user" || query === ""
                              ? "contained"
                              : "outlined"
                        }
                     >
                        User
                     </Button>
                  </Link>
               </div>
               <div className="tab-link">
                  <Link
                     to={location => ({
                        ...location,
                        search: "?tab=organizations",
                     })}
                  >
                     <Button
                        className={classes.tabBtn}
                        variant={
                           query === "organizations" ? "contained" : "outlined"
                        }
                     >
                        Organizations
                     </Button>
                  </Link>
               </div>
               <div className="tab-link">
                  <Link
                     to={location => ({
                        ...location,
                        search: "?tab=projects",
                     })}
                  >
                     <Button
                        className={classes.tabBtn}
                        variant={
                           query === "projects" ? "contained" : "outlined"
                        }
                     >
                        Projects
                     </Button>
                  </Link>
               </div>
               <div className="tab-link">
                  <Link
                     to={location => ({
                        ...location,
                        search: "?tab=issues",
                     })}
                  >
                     <Button
                        className={classes.tabBtn}
                        variant={query === "issues" ? "contained" : "outlined"}
                     >
                        Issues
                     </Button>
                  </Link>
               </div>
            </div>
            <div className="profile-contents">
               <div className="profile-picture-section">
                  <img
                     id="profilePictureBig"
                     src={`/api/profile/profile-image/${Profile.UniqueUsername}`}
                     alt=""
                  />
                  <div className="profile-picture-caption">
                     <strong>@{Profile.UniqueUsername}</strong>
                  </div>
                  {owner && (
                     <div className="profile-edit">
                        <Button
                           color="primary"
                           variant="outlined"
                           fullWidth
                           onClick={goToUpdate}
                        >
                           Edit Profile
                        </Button>
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
         <NotFound />
      );
   }
}

export default UserProfile;
