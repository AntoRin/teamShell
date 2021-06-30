import { Router } from "express";
import { authServiceClient } from "../services/auth.service";

const router = Router();

router.post("/register", authServiceClient.registerUser);

router.post("/login", authServiceClient.loginUser);

//GitHub Login
router.get("/login/github", authServiceClient.loginUserViaGitHub);

router.get(
   "/login/github/callback",
   authServiceClient.handleGitHubLoginCallback
);

//Google login
router.get("/login/google", authServiceClient.loginUserViaGoogle);

router.get(
   "/login/google/callback",
   authServiceClient.handleGoogleLoginCallback
);

router.get("/logout", authServiceClient.logoutUser);

router.get("/verify", authServiceClient.verifyUserCreds);

export default router;
