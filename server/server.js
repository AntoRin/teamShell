const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const checkAuth = require("./middleware/checkAuth");

const authRoute = require("./routes/auth");
const profileRoute = require("./routes/profile");
const organizationRoute = require("./routes/organization");
const projectRoute = require("./routes/project");
const issueRoute = require("./routes/issue");

const app = express();

app.use(express.json());
app.use(
   cors({
      origin: "http://localhost:3000",
      credentials: true,
   })
);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../build")));

app.use("/auth", authRoute);
app.use("/profile", checkAuth, profileRoute);
app.use("/organization", checkAuth, organizationRoute);
app.use("/project", checkAuth, projectRoute);
app.use("/issue", checkAuth, issueRoute);

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
         app.listen(port, () => console.log(`Listening on port ${port}`));
      }
   }
);
