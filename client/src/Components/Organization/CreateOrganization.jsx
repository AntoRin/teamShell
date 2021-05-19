import { useState } from "react";
import { useHistory } from "react-router-dom";
import "../../styles/create-form.css";

function CreateOrganization() {
   const [inputs, setInputs] = useState({
      newCreateName: "",
      newCreationDescription: "",
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

   async function handleOrgCreation(event) {
      event.preventDefault();
      let body = {
         OrganizationName: inputs.newCreateName,
         Description: inputs.newCreationDescription,
      };

      let postOptions = {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(body),
         credentials: "include",
      };

      let createOrgRequest = await fetch("/organization/create", postOptions);
      let createOrgResponse = await createOrgRequest.json();

      if (createOrgResponse.status === "ok")
         history.push(`/organization/${inputs.newCreateName}`);
   }

   return (
      <div className="new-create-form-container">
         <div className="new-create-form-card">
            <div className="form-card-title">
               <h1>Create a new Organization</h1>
            </div>
            <form onSubmit={handleOrgCreation} id="createForm">
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
                  pattern="^[a-zA-Z0-9_-]*$"
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
