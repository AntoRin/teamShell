import { useState } from "react";
import { useHistory } from "react-router-dom";
import "../../create-organization.css";

function CreateOrganization() {
   const [inputs, setInputs] = useState({
      newOrgName: "",
      newOrgDescription: "",
   });

   const history = useHistory();

   function handleChange(event) {
      setInputs({
         ...inputs,
         [event.target.id]: event.target.value,
      });
   }

   function cancelCreateOrg() {
      history.push("/user/home");
   }

   //------------------Change post options-----------------------

   async function handleOrgCreation(event) {
      event.preventDefault();
      let body = {
         OrganizationName: inputs.newOrgName,
         Description: inputs.newOrgDescription,
      };

      let postOptions = {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(body),
         credentials: "include",
      };

      let createOrgRequest = await fetch(
         "http://localhost:5000/organization/create",
         postOptions
      );
      let createOrgResponse = await createOrgRequest.json();
      console.log(createOrgResponse);
      if (createOrgResponse.status === "ok")
         history.push(`/organization/${inputs.newOrgName}`);
   }

   return (
      <div className="new-organization-form-container">
         <div className="new-org-form-card">
            <div className="form-card-title">
               <h1>Create a new Organization</h1>
            </div>
            <form onSubmit={handleOrgCreation} id="createOrgForm">
               <label htmlFor="newOrgName">Name:</label>
               <br />
               <input
                  onChange={handleChange}
                  value={inputs.newOrgName}
                  type="text"
                  autoComplete="off"
                  required
                  id="newOrgName"
                  className="input-org-create"
               />
               <br />
               <br />
               <label htmlFor="newOrgDescription">Description:</label>
               <br />
               <br />
               <textarea
                  onChange={handleChange}
                  value={inputs.newOrgDescription}
                  id="newOrgDescription"
                  maxLength="100"
                  required
                  rows="7"
               ></textarea>
               <div className="create-form-action">
                  <button
                     onClick={cancelCreateOrg}
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
   );
}

export default CreateOrganization;
