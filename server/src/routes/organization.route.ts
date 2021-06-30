import { Router } from "express";
import { handleNotifications } from "../utils/notificationHandler";
import { organizationServiceClient } from "../services/organization.service";

const router = Router();

router.post("/create", organizationServiceClient.createNewOrganization);

router.get(
   "/details/:OrganizationName",
   organizationServiceClient.getSingleOrganization
);

router.post("/edit", organizationServiceClient.editOrganization);

router.post(
   "/invite/new-user",
   organizationServiceClient.inviteUserToOrganization,
   handleNotifications
);

router.get(
   "/add/new-user/:userSecret",
   organizationServiceClient.addUserToOrganizationWithUserSecret,
   handleNotifications
);

router.get(
   "/join-request/:organizationName",
   organizationServiceClient.sendJoinRequestToOrganization,
   handleNotifications
);

router.get(
   "/accept/new-user",
   organizationServiceClient.acceptUserToOrganization,
   handleNotifications
);

router.get(
   "/leave/:organizationName",
   organizationServiceClient.leaveOrganization,
   handleNotifications
);

router.get("/explore", organizationServiceClient.getExplorerData);

export default router;
