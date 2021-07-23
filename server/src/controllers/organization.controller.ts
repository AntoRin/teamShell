import { handleNotifications } from "../utils/notificationHandler";
import { OrganizationService } from "../services/organization.service";
import { RestController, GET, POST, Factory, OnRequestEntry } from "dipress";
import checkAuth from "../middleware/checkAuth";

@RestController("/api/organization")
@OnRequestEntry(checkAuth)
export class OrganizationController {
   public constructor(private _organizationServiceClient: OrganizationService) {}

   @POST("/create")
   @Factory
   createNewOrganization() {
      return this._organizationServiceClient.createNewOrganization;
   }

   @GET("/details/:OrganizationName")
   @Factory
   getSingleOrganization() {
      return this._organizationServiceClient.getSingleOrganization;
   }

   @POST("/edit")
   @Factory
   editOrganization() {
      return this._organizationServiceClient.editOrganization;
   }

   @POST("/invite/new-user")
   @Factory
   inviteUserToOrganization() {
      return [this._organizationServiceClient.inviteUserToOrganization, handleNotifications];
   }

   @GET("/add/new-user/:userSecret")
   @Factory
   addUserToOrganizationWithUserSecret() {
      return [this._organizationServiceClient.addUserToOrganizationWithUserSecret, handleNotifications];
   }

   @GET("/join-request/:organizationName")
   @Factory
   sendJoinRequestToOrganization() {
      return [this._organizationServiceClient.sendJoinRequestToOrganization, handleNotifications];
   }

   @GET("/accept/new-user")
   @Factory
   acceptUserToOrganization() {
      return [this._organizationServiceClient.acceptUserToOrganization, handleNotifications];
   }

   @GET("/leave/:organizationName")
   @Factory
   leaveOrganization() {
      return [this._organizationServiceClient.leaveOrganization, handleNotifications];
   }

   @GET("/explore")
   @Factory
   getExplorerData() {
      return this._organizationServiceClient.getExplorerData;
   }
}
