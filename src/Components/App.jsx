import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import LandingPage from "./Landing/LandingPage";
import Register from "./Authorization/Register";
import Login from "./Authorization/Login";
import UserHome from "./User/UserHome";
import UserProfile from "./User/UserProfile";
import ProtectedRoute from "./ProtectedRoute";
import NonUserRoute from "./NonUserRoute";

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
               <Route path="/" component={LandingPage} />
            </Switch>
         </div>
      </Router>
   );
}

export default App;
