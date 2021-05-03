function errorHandler(error, req, res, next) {
   switch (error.code) {
      case 11000:
         return res
            .status(400)
            .json({ status: "error", error: "User already exists" });
      case "AuthFailure":
         return res.status(400).json({ status: "error", error: error.message });
      default:
         return res
            .status(500)
            .json({ status: "error", error: "Internal server error" });
   }
}

module.exports = errorHandler;
