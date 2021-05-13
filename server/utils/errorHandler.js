function errorHandler(error, req, res, next) {
   console.log(error.name);
   switch (error.name) {
      case "MongoError":
         return res
            .status(400)
            .json({ status: "error", error: "User already exists" });
      case "AuthFailure":
         return res
            .status(401)
            .json({ status: "error", error: "Invalid credentials" });
      case "JsonWebTokenError":
         return res
            .status(401)
            .json({ status: "error", error: "You need to be logged in" });
      case "UnknownData":
         return res.status(400).json({
            status: "error",
            error: "Bad request, relevant data not found",
         });
      case "UnauthorizedRequest":
         return res.status(401).json({
            status: "error",
            error: "You're not authorized to make that request",
         });
      case "UploadFailure":
         return res.status(409).json({
            status: "error",
            error: "There was a problem with your upload",
         });
      case "SilentEnd":
         return res.status(200).end();
      case "ServerError":
         return res
            .status(500)
            .json({ status: "error", error: "Internal server error" });
      case "OrganizationAuthFail":
         return res.status(401).json({
            status: "error",
            error: "You are not part of the Organization",
         });
      case "OrgInvitationRebound":
         return res.status(400).json({
            status: "error",
            error: "You are already a part of the organization",
         });
      case "ProjectInvitationRebound":
         return res
            .status(400)
            .json({ status: "error", error: "You are already in the project" });
      case "ValidationError":
         return res
            .status(400)
            .json({ status: "error", error: "Validation Error" });
      default:
         return res
            .status(500)
            .json({ status: "error", error: "Internal server error" });
   }
}

module.exports = errorHandler;
