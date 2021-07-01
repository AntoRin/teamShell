import { Router } from "express";
import { handleNotifications } from "../utils/notificationHandler";
import { organizationServiceClient } from "../services/organization.service";
import { GET, POST } from "../decorators/RestController";

class OrganizationController {
   private static _controllerInstance: OrganizationController | null = null;
   private static router = Router();

   private constructor() {}

   public static get controllerInstance() {
      if (!this._controllerInstance)
         this._controllerInstance = new OrganizationController();

      return this._controllerInstance;
   }

   get routerInstance() {
      return OrganizationController.router;
   }

   @POST("/create")
   createNewOrganization() {
      return organizationServiceClient.createNewOrganization;
   }

   @GET("/details/:OrganizationName")
   getSingleOrganization() {
      return organizationServiceClient.getSingleOrganization;
   }

   @POST("/edit")
   editOrganization() {
      return organizationServiceClient.editOrganization;
   }

   @POST("/invite/new-user")
   inviteUserToOrganization() {
      return [
         organizationServiceClient.inviteUserToOrganization,
         handleNotifications,
      ];
   }

   @GET("/add/new-user/:userSecret")
   addUserToOrganizationWithUserSecret() {
      return [
         organizationServiceClient.addUserToOrganizationWithUserSecret,
         handleNotifications,
      ];
   }

   @GET("/join-request/:organizationName")
   sendJoinRequestToOrganization() {
      return [
         organizationServiceClient.sendJoinRequestToOrganization,
         handleNotifications,
      ];
   }

   @GET("/accept/new-user")
   acceptUserToOrganization() {
      return [
         organizationServiceClient.acceptUserToOrganization,
         handleNotifications,
      ];
   }

   @GET("/leave/:organizationName")
   leaveOrganization() {
      return [organizationServiceClient.leaveOrganization, handleNotifications];
   }

   @GET("/explore")
   getExplorerData() {
      return organizationServiceClient.getExplorerData;
   }
}

export default OrganizationController.controllerInstance.routerInstance;
