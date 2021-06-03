import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { Container } from "@material-ui/core";
import { useHistory } from "react-router";

const useStyles = makeStyles({
   cardContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexWrap: "wrap",
   },
   card: {
      minWidth: 275,
      maxWidth: "50%",
      margin: "30px",
      backgroundColor: "rgb(108, 98, 140)",
   },
});

function WorkspaceSelection({ User, currentOrg }) {
   const classes = useStyles();

   const history = useHistory();

   function goToWorkspace(project) {
      history.push(
         `/user/workspace?organization=${currentOrg}&project=${project}&tab=${"issues"}`
      );
   }

   return (
      <Container className={classes.cardContainer}>
         {User.Projects.length > 0 &&
            User.Projects.map(project => {
               return project.ParentOrganization === currentOrg ? (
                  <Card key={project._id} className={classes.card}>
                     <CardContent>
                        <Typography variant="h4" gutterBottom>
                           {project.ProjectName}
                        </Typography>
                     </CardContent>
                     <CardActions>
                        <Button
                           variant="outlined"
                           size="large"
                           onClick={() => goToWorkspace(project.ProjectName)}
                        >
                           Go to project
                        </Button>
                     </CardActions>
                  </Card>
               ) : null;
            })}
      </Container>
   );
}

export default WorkspaceSelection;
