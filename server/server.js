const express = require("express");
const mongoose = require("mongoose");
const socketio = require("socket.io");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const cookie = require("cookie");
require("dotenv").config();

//Routes
const authRoute = require("./routes/auth");
const profileRoute = require("./routes/profile");
const organizationRoute = require("./routes/organization");
const projectRoute = require("./routes/project");
const issueRoute = require("./routes/issue");

const errorHandler = require("./utils/errorHandler");

//Models
const User = require("./models/User");
const Project = require("./models/Project");
const Issue = require("./models/Issue");

const app = express();

//Middleware
const checkAuth = require("./middleware/checkAuth");
const verifySocketIntegrity = require("./middleware/verifySocketIntegrity");

app.use(express.json());
app.use(
   cors({
      origin: "http://localhost:3000",
      credentials: true,
   })
);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../client/build")));

app.use("/auth", authRoute);
app.use("/profile", checkAuth, profileRoute);
app.use("/organization", checkAuth, organizationRoute);
app.use("/project", checkAuth, projectRoute);
app.use("/issue", checkAuth, issueRoute);
app.use("*", (req, res) => {
   res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

//Error handler
app.use(errorHandler);

const port = process.env.PORT || 5000;

//Server and Database connections
mongoose.connect(
   process.env.MONGO_URI,
   {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
   },
   (err, connection) => {
      if (err) return console.log(err);
      else {
         console.log("Database connection established");
         let server = app.listen(port, () =>
            console.log(`Listening on port ${port}`)
         );

         let io = socketio(server, {
            cors: {
               origin: "http://localhost:3000",
               methods: ["GET", "POST"],
               credentials: true,
            },
         });

         io.use((socket, next) => {
            socket.on("disconnect", () => console.log("Disconnected"));
            let unParsedCookies = socket.handshake.headers.cookie;
            let allCookies = cookie.parse(unParsedCookies);
            let token = allCookies.token;
            socket.authToken = token;
            next();
         });

         io.use(verifySocketIntegrity);

         io.on("connection", socket => {
            console.log("Connected: ", socket.id);
            let UserStatus = User.watch();
            let ProjectStatus = Project.watch();
            let IssueStatus = Issue.watch();

            UserStatus.on("change", () => {
               io.to(socket.id).emit("user-data-change");
            });

            ProjectStatus.on("change", diff => {
               if (diff.operationType === "update") {
                  io.to(socket.id).emit("project-data-change");
               }
            });

            IssueStatus.on("change", () => {
               io.to(socket.id).emit("issue-data-change");
            });
         });
      }
   }
);
