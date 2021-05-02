import { BrowserRouter as Router, Switch } from "react-router-dom";
import LandingPage from "./Landing/LandingPage";
import Register from "./Authorization/Register";
import Login from "./Authorization/Login";
import UserHome from "./User/UserHome";
import UserProfile from "./User/UserProfile";
import ProtectedRoute from "../UtilityComponents/ProtectedRoute";
import NonUserRoute from "../UtilityComponents/NonUserRoute";
import CreateOrganization from "./Organization/CreateOrganization";
import OrganizationHome from "./Organization/OrganizationHome";
import CreateProject from "./Project/CreateProject";
import ProjectHome from "./Project/ProjectHome";
import UserEnvironment from "./User/UserEnvironment";
import IssueHome from "./Issue/IssueHome";

function App() {
   return (
      <Router>
         <div>
            <Switch>
               <NonUserRoute path="/" exact component={LandingPage} />
               <NonUserRoute path="/register" exact component={Register} />
               <NonUserRoute path="/login" exact component={Login} />
               <ProtectedRoute path="/user/home" exact component={UserHome} />
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
               <ProtectedRoute path="/issue/:IssueID" component={IssueHome} />
               <ProtectedRoute path="/" component={UserHome} />
            </Switch>
         </div>
      </Router>
   );
}

export default App;
