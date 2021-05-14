const jwt = require("jsonwebtoken");

function verifySocketIntegrity(socket, next) {
   try {
      let thisUser = jwt.verify(socket.authToken, process.env.JWT_SECRET);

      return next();
   } catch (error) {
      let err = new Error(error.message);
      console.log(err);
      socket.disconnect();
      return next(err);
   }
}

module.exports = verifySocketIntegrity;
