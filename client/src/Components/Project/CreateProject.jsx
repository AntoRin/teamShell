import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import "../../styles/create-form.css";

function CreateProject({ location, User }) {
   const [inputs, setInputs] = useState({
      newCreateName: "",
      newCreationDescription: "",
   });
   const [parentOrg, setParentOrg] = useState("");

   const history = useHistory();

   useEffect(() => {
      if (location.search) {
         let query = location.search.split("?")[1];
         let queryKey = query.split("=")[0];
         if (queryKey === "Organization") {
            let queryValue = query.split("=")[1];
            if (
               User.Organizations.find(Org => {
                  return Org.OrganizationName === queryValue;
               })
            ) {
               setParentOrg(queryValue);
            } else {
               setParentOrg(
                  User.Organizations.length > 0
                     ? User.Organizations[0].OrganizationName
                     : ""
               );
            }
         }
      } else {
         setParentOrg(
            User.Organizations.length > 0
               ? User.Organizations[0].OrganizationName
               : ""
         );
      }
   }, [location, User.Organizations]);

   function handleSelectChange(event) {
      setParentOrg(event.target.value);
   }

   function handleChange(event) {
      setInputs({
         ...inputs,
         [event.target.id]: event.target.value,
      });
   }

   function cancelCreateProject() {
      history.push("/user/home");
   }

   async function handleProjectCreation(event) {
      event.preventDefault();

      let body = {
         ProjectName: inputs.newCreateName,
         ProjectDescription: inputs.newCreationDescription,
         ParentOrganization: parentOrg,
      };

      if (!parentOrg) {
         console.error("You are not part of any organization");
         return;
      }

      let postOptions = {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(body),
         credentials: "include",
      };

      let createProject = await fetch("/project/create", postOptions);
      let createProjectResponse = await createProject.json();

      if (createProjectResponse.status === "ok")
         history.push(`/project/${parentOrg}/${inputs.newCreateName}`);
   }

   return parentOrg ? (
      <div className="new-create-form-container">
         <div className="new-create-form-card">
            <div className="form-card-title">
               <h1>Create a new Project</h1>
            </div>
            <form onSubmit={handleProjectCreation} id="createForm">
               <label htmlFor="parentOrgSelector">Organization:</label>
               <select
                  value={parentOrg}
                  onChange={handleSelectChange}
                  id="parentOrgSelector"
               >
                  {User.Organizations.map((Org, index) => {
                     return (
                        <option key={index} value={Org.OrganizationName}>
                           {Org.OrganizationName}
                        </option>
                     );
                  })}
               </select>
               <br />
               <br />
               <label htmlFor="newCreateName">Name:</label>
               <br />
               <input
                  onChange={handleChange}
                  value={inputs.newCreateName}
                  type="text"
                  autoComplete="off"
                  required
                  id="newCreateName"
                  className="input-create-form"
               />
               <br />
               <br />
               <label htmlFor="newCreationDescription">Description:</label>
               <br />
               <br />
               <textarea
                  onChange={handleChange}
                  value={inputs.newCreationDescription}
                  id="newCreationDescription"
                  maxLength="100"
                  required
                  rows="7"
               ></textarea>
               <div className="create-form-action">
                  <button
                     onClick={cancelCreateProject}
                     className="form-action-btn dull"
                     type="button"
                  >
                     Cancel
                  </button>
                  <button className="form-action-btn bright" type="submit">
                     Create
                  </button>
               </div>
            </form>
         </div>
      </div>
   ) : (
      <div className="new-create-form-container">
         <div className="new-create-form-card">
            <h1>You are not part of any organization.</h1>
         </div>
      </div>
   );
}

export default CreateProject;
