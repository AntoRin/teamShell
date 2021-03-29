const jwt = require("jsonwebtoken");

function checkAuth(req, res, next) {
   const token = req.cookies.token;

   try {
      let thisUser = jwt.verify(token, process.env.JWT_SECRET);
      req.thisUser = thisUser;
      return next();
   } catch (error) {
      return res.status(401).json({ status: "error", error: error.message });
   }
}

module.exports = checkAuth;
