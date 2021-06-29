import { Router } from "express";
import { handleNotifications } from "../utils/notificationHandler";
import { OrganizationService } from "../services/organization.service";

const router = Router();

router.post("/create", OrganizationService.createNewOrganization);

router.get(
   "/details/:OrganizationName",
   OrganizationService.getSingleOrganization
);

router.post("/edit", OrganizationService.editOrganization);

router.post(
   "/invite/new-user",
   OrganizationService.inviteUserToOrganization,
   handleNotifications
);

router.get(
   "/add/new-user/:userSecret",
   OrganizationService.addUserToOrganizationWithUserSecret,
   handleNotifications
);

router.get(
   "/join-request/:organizationName",
   OrganizationService.sendJoinRequestToOrganization,
   handleNotifications
);

router.get(
   "/accept/new-user",
   OrganizationService.acceptUserToOrganization,
   handleNotifications
);

router.get(
   "/leave/:organizationName",
   OrganizationService.leaveOrganization,
   handleNotifications
);

router.get("/explore", OrganizationService.getExplorerData);

export default router;
