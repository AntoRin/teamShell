const express = require("express");
const mongoose = require("mongoose");
const socketio = require("socket.io");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

//Routes
const authRoute = require("./routes/auth");
const profileRoute = require("./routes/profile");
const organizationRoute = require("./routes/organization");
const projectRoute = require("./routes/project");
const issueRoute = require("./routes/issue");
const chatRoute = require("./routes/chat");
const meetRoute = require("./routes/meet");

const errorHandler = require("./utils/errorHandler");

const app = express();

//Middleware
const checkAuth = require("./middleware/checkAuth");
const {
   parseCookies,
   initiateListeners,
   verifySocketIntegrity,
} = require("./socketHandlers");

app.use(express.json({ limit: 500000 }));
// app.use(
//    cors({
//       origin: "http://localhost:3000",
//       credentials: true,
//    })
// );
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../client/build")));

app.use("/api/auth", authRoute);
app.use("/api/profile", checkAuth, profileRoute);
app.use("/api/organization", checkAuth, organizationRoute);
app.use("/api/project", checkAuth, projectRoute);
app.use("/api/issue", checkAuth, issueRoute);
app.use("/api/chat", checkAuth, chatRoute);
app.use("/api/meet", checkAuth, meetRoute);
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
   err => {
      if (err) return console.log(err);
      else {
         console.log("[server] Database connection established");

         let server = app.listen(port, () =>
            console.log(`[server] Listening on port ${port}`)
         );

         let io = socketio(server);

         io.use(parseCookies);

         io.use(verifySocketIntegrity);

         io.on("connection", socket => initiateListeners(socket, io));
      }
   }
);
