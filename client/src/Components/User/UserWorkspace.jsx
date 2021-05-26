import { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router";
import { SocketInstance } from "../UtilityComponents/ProtectedRoute";
import parseQueryStrings from "../../utils/parseQueryStrings";

function UserWorkspace({ location }) {
   const [parentOrg, setParentOrg] = useState(null);
   const [activeProject, setActiveProject] = useState(null);
   const [projectDetails, setProjectDetails] = useState({});
   const [isLoading, setIsLoading] = useState(true);

   const history = useHistory();

   const socket = useContext(SocketInstance);

   useEffect(() => {
      let queryString = location.search;
      console.log();
      if (queryString) {
         let queries = parseQueryStrings(queryString);
         setParentOrg(queries.organization);
         setActiveProject(queries.project);
      } else {
         history.push("/user/environment");
      }
   }, []);

   useEffect(() => {
      let abortFetch = new AbortController();

      async function getProjectDetails() {
         try {
            if (!activeProject) {
               setProjectDetails({});
               setIsLoading(false);
               return;
            }

            let projectRequest = await fetch(
               `/api/project/details/${activeProject}`,
               { credentials: "include", signal: abortFetch.signal }
            );

            if (abortFetch.signal.aborted) return;

            let projectResponse = await projectRequest.json();

            if (projectResponse.status === "ok") {
               let project = projectResponse.Project;
               setProjectDetails(project);
               setIsLoading(false);
            }
         } catch (error) {
            console.log(error);
         }
      }
      getProjectDetails();

      socket.on("project-data-change", () => getProjectDetails());

      return () => {
         abortFetch.abort();
         socket.off("project-data-change");
      };
   }, [activeProject, socket]);

   return (
      <div>
         <h1>Workspace</h1>
      </div>
   );
}

export default UserWorkspace;
