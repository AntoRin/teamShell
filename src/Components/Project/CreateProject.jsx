import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import "../../create-form.css";

function CreateProject({ location }) {
   const [parentOrg, setParentOrg] = useState("");
   const [inputs, setInputs] = useState({
      newCreateName: "",
      newCreationDescription: "",
   });

   const history = useHistory();

   useEffect(() => {
      if (location.search) {
         let query = location.search.split("?")[1];
         let queryKey = query.split("=")[0];
         if (queryKey === "Organization") {
            setParentOrg(query.split("=")[1]);
         }
      }
   }, [location]);

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
   }

   return (
      <div className="new-create-form-container">
         <div className="new-create-form-card">
            <div className="form-card-title">
               <h1>Create a new Project</h1>
            </div>
            <form onSubmit={handleProjectCreation} id="createForm">
               <label htmlFor="newCreateName">Name:</label>
               <br />
               <input
                  onChange={handleChange}
                  value={inputs.newProjectName}
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
                  value={inputs.newProjectDescription}
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
   );
}

export default CreateProject;
