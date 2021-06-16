import { useState, createContext } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import ProtectedRoute from "./UtilityComponents/ProtectedRoute";
import PublicRoute from "./UtilityComponents/PublicRoute";
import LandingPage from "./Pages/LandingPage";
import Register from "./Pages/Register";
import Login from "./Pages/Login";
import UserHome from "./Pages/UserHome";
import UserProfile from "./Pages/UserProfile";
import UserEnvironment from "./Pages/UserEnvironment";
import UserWorkspace from "./Pages/UserWorkspace";
import CreateOrganization from "./Pages/CreateOrganization";
import OrganizationHome from "./Pages/OrganizationHome";
import CreateProject from "./Pages/CreateProject";
import ProjectHome from "./Pages/ProjectHome";
import IssueHome from "./Pages/IssueHome";
import MeetRoom from "./Pages/MeetRoom";
import NotFound from "./Pages/NotFound";
import StatusBar from "./UtilityComponents/StatusBar";

export const GlobalActionStatus = createContext();

function App() {
   const [actionStatus, setActionStatus] = useState({ info: null, type: null });

   return (
      <Router>
         <div>
            <GlobalActionStatus.Provider value={setActionStatus}>
               <Switch>
                  <PublicRoute path="/" exact component={LandingPage} />
                  <PublicRoute path="/register" exact component={Register} />
                  <PublicRoute path="/login" exact component={Login} />
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
                  <Route path="/" component={NotFound} />
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
