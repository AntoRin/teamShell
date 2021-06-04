import { useState, createContext } from "react";
import { BrowserRouter as Router, Switch } from "react-router-dom";
import LandingPage from "./Landing/LandingPage";
import Register from "./Authorization/Register";
import Login from "./Authorization/Login";
import UserHome from "./User/UserHome";
import UserProfile from "./User/UserProfile";
import ProtectedRoute from "./UtilityComponents/ProtectedRoute";
import NonUserRoute from "./UtilityComponents/NonUserRoute";
import CreateOrganization from "./Organization/CreateOrganization";
import OrganizationHome from "./Organization/OrganizationHome";
import CreateProject from "./Project/CreateProject";
import ProjectHome from "./Project/ProjectHome";
import UserEnvironment from "./User/UserEnvironment";
import UserWorkspace from "./User/UserWorkspace";
import IssueHome from "./Issue/IssueHome";
import MeetRoom from "./User/MeetRoom";
import StatusBar from "./UtilityComponents/StatusBar";

export const GlobalActionStatus = createContext();

function App() {
   const [actionStatus, setActionStatus] = useState({ info: null, type: null });

   return (
      <Router>
         <div>
            <GlobalActionStatus.Provider value={setActionStatus}>
               <Switch>
                  <NonUserRoute path="/" exact component={LandingPage} />
                  <NonUserRoute path="/register" exact component={Register} />
                  <NonUserRoute path="/login" exact component={Login} />
                  <ProtectedRoute
                     path="/user/home"
                     exact
                     component={UserHome}
                  />
                  <ProtectedRoute
                     path="/user/profile/:UniqueUsername"
                     exact
                     component={UserProfile}
                  />
                  <ProtectedRoute
                     path="/create/organization"
                     exact
                     component={CreateOrganization}
                  />
                  <ProtectedRoute
                     path="/organization/:OrganizationName"
                     exact
                     component={OrganizationHome}
                  />
                  <ProtectedRoute
                     path="/create/project"
                     exact
                     component={CreateProject}
                  />
                  <ProtectedRoute
                     path="/project/:OrganizationName/:ProjectName"
                     exact
                     component={ProjectHome}
                  />
                  <ProtectedRoute
                     path="/user/environment"
                     exact
                     component={UserEnvironment}
                  />
                  <ProtectedRoute
                     path="/user/workspace"
                     exact
                     component={UserWorkspace}
                  />
                  <ProtectedRoute
                     path="/issue/:IssueID"
                     exact
                     component={IssueHome}
                  />
                  <ProtectedRoute
                     path="/meet-room/:roomId"
                     exact
                     component={MeetRoom}
                  />
                  <ProtectedRoute path="/" component={UserHome} />
               </Switch>
            </GlobalActionStatus.Provider>
            {actionStatus.info && (
               <StatusBar
                  actionStatus={actionStatus}
                  setActionStatus={setActionStatus}
               />
            )}
         </div>
      </Router>
   );
}

export default App;
