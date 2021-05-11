const jwt = require("jsonwebtoken");

function checkAuth(req, res, next) {
   const token = req.cookies.token;
   try {
      let thisUser = jwt.verify(token, process.env.JWT_SECRET);
      req.thisUser = thisUser;
      return next();
   } catch (error) {
      return next(error);
   }
}

module.exports = checkAuth;
