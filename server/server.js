const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const authRoute = require("./routes/auth");

const app = express();

app.use(
   cors({
      origin: "http://localhost:3000",
      credentials: true,
   })
);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../build")));

app.use("/auth", authRoute);

const port = process.env.PORT || 5000;

//Server and Database connections
mongoose.connect(
   process.env.MONGO_URI,
   {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true,
   },
   (err, connection) => {
      if (err) return console.log(err);
      else {
         console.log("Database connection established");
         app.listen(port, () => console.log(`Listening on port ${port}`));
      }
   }
);
