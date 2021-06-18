function errorHandler(error, req, res, next) {
   console.log(error.name);
   switch (error.name) {
      case "MongoError":
         if (error.code === 31254)
            return res
               .status(500)
               .json({ status: "error", error: "Internal server serror" });
         else
            return res
               .status(400)
               .json({ status: "error", error: "User already exists" });
      case "MulterError":
         return error.code === "LIMIT_FILE_SIZE"
            ? res.status(413).json({
                 status: "error",
                 error: "File size too large; try uploading an image with size less than 0.5MB",
              })
            : res
                 .status(500)
                 .json({ status: "error", error: "Error uploading file" });
      case "JsonWebTokenError":
         return res
            .status(401)
            .json({ status: "error", error: "You need to be logged in" });
      case "AuthenticationError":
         return res
            .status(401)
            .json({ status: "error", error: "Invalid credentials" });
      case "BadRequestError":
         return res.status(400).json({
            status: "error",
            error: "Bad request, relevant data not found",
         });
      case "ResourceNotFound":
         return res
            .status(404)
            .json({ status: "error", error: "Resource not found" });
      case "NoDataResponse":
         return res.status(204).json({ status: "ok", data: null });
      case "UserNotFoundError":
         return res
            .status(400)
            .json({ status: "error", error: "User not found" });
      case "UnauthorizedRequestError":
         return res.status(401).json({
            status: "error",
            error: "You're not authorized to make that request",
         });
      case "UploadFailureError":
         return res.status(409).json({
            status: "error",
            error: "There was a problem with your upload",
         });
      case "NoActionRequiredError":
         return res.status(200).end();
      case "ServerError":
         return res
            .status(500)
            .json({ status: "error", error: "Internal server error" });
      case "OrganizationAuthFailError":
         return res.status(401).json({
            status: "error",
            error: "You are not part of the Organization",
         });
      case "OrgInvitationReboundError":
         return res.status(400).json({
            status: "error",
            error: "User is already a part of the organization",
         });
      case "ProjectInvitationReboundError":
         return res
            .status(400)
            .json({ status: "error", error: "User is already in the project" });
      case "ValidationError":
         return res
            .status(400)
            .json({ status: "error", error: "Validation Error" });
      case "IrrevertibleActionError":
         return res
            .status(400)
            .json({ status: "error", error: "The action is irrevertible" });
      default:
         return res
            .status(500)
            .json({ status: "error", error: "Internal server error" });
   }
}

module.exports = errorHandler;
