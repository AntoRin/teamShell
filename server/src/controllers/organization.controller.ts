import { handleNotifications } from "../utils/notificationHandler";
import { organizationServiceClient } from "../services/organization.service";
import { RestController, GET, POST, Factory, UseMiddlewares } from "express-frills";
import checkAuth from "../middleware/checkAuth";

@RestController("/api/organization")
@UseMiddlewares(checkAuth)
class OrganizationController {
   private static _controllerInstance: OrganizationController | null = null;

   private constructor() {}

   public static get controllerInstance() {
      if (!this._controllerInstance)
         this._controllerInstance = new OrganizationController();

      return this._controllerInstance;
   }

   @POST("/create")
   @Factory
   createNewOrganization() {
      return organizationServiceClient.createNewOrganization;
   }

   @GET("/details/:OrganizationName")
   @Factory
   getSingleOrganization() {
      return organizationServiceClient.getSingleOrganization;
   }

   @POST("/edit")
   @Factory
   editOrganization() {
      return organizationServiceClient.editOrganization;
   }

   @POST("/invite/new-user")
   @Factory
   inviteUserToOrganization() {
      return [organizationServiceClient.inviteUserToOrganization, handleNotifications];
   }

   @GET("/add/new-user/:userSecret")
   @Factory
   addUserToOrganizationWithUserSecret() {
      return [
         organizationServiceClient.addUserToOrganizationWithUserSecret,
         handleNotifications,
      ];
   }

   @GET("/join-request/:organizationName")
   @Factory
   sendJoinRequestToOrganization() {
      return [
         organizationServiceClient.sendJoinRequestToOrganization,
         handleNotifications,
      ];
   }

   @GET("/accept/new-user")
   @Factory
   acceptUserToOrganization() {
      return [organizationServiceClient.acceptUserToOrganization, handleNotifications];
   }

   @GET("/leave/:organizationName")
   @Factory
   leaveOrganization() {
      return [organizationServiceClient.leaveOrganization, handleNotifications];
   }

   @GET("/explore")
   @Factory
   getExplorerData() {
      return organizationServiceClient.getExplorerData;
   }
}

export default OrganizationController;
