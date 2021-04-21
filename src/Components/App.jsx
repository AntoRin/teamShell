import { createContext } from "react";
import io from "socket.io-client";
import { BrowserRouter as Router, Switch } from "react-router-dom";
import LandingPage from "./Landing/LandingPage";
import Register from "./Authorization/Register";
import Login from "./Authorization/Login";
import UserHome from "./User/UserHome";
import UserProfile from "./User/UserProfile";
import ProtectedRoute from "./ProtectedRoute";
import NonUserRoute from "./NonUserRoute";
import CreateOrganization from "./Organization/CreateOrganization";
import OrganizationHome from "./Organization/OrganizationHome";
import CreateProject from "./Project/CreateProject";
import ProjectHome from "./Project/ProjectHome";
import UserEnvironment from "./User/UserEnvironment";

let socket = io("http://localhost:5000");

export const SocketInstance = createContext();

function App() {
   return (
      <Router>
         <div>
            <SocketInstance.Provider value={socket}>
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
                  <ProtectedRoute path="/" component={UserHome} />
               </Switch>
            </SocketInstance.Provider>
         </div>
      </Router>
   );
}

export default App;
