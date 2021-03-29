const jwt = require("jsonwebtoken");

async function isLoggedIn(token) {
   try {
      const user = jwt.verify(token, process.env.JWT_SECRET);
      if (user) return user;
      else throw "User not found";
   } catch (err) {
      let error = new Error(err);
      return error;
   }
}

module.exports = isLoggedIn;
