const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function isLoggedIn(token) {
   try {
      const { UniqueUsername, Email } = jwt.verify(
         token,
         process.env.JWT_SECRET
      );
      const user = await User.findOne({ UniqueUsername, Email });
      if (user) return true;
      else throw "User not present in DB";
   } catch (err) {
      let error = new Error(err);
      return error;
   }
}

module.exports = isLoggedIn;
