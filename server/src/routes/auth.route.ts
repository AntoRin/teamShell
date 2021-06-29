import { Router } from "express";
import { AuthService } from "../services/auth.service";

const router = Router();

router.post("/register", AuthService.registedUser);

router.post("/login", AuthService.loginUser);

//GitHub Login
router.get("/login/github", AuthService.loginUserViaGitHub);

router.get("/login/github/callback", AuthService.handleGitHubLoginCallback);

//Google login
router.get("/login/google", AuthService.loginUserViaGoogle);

router.get("/login/google/callback", AuthService.handleGoogleLoginCallback);

router.get("/logout", AuthService.logoutUser);

router.get("/verify", AuthService.verifyUserCreds);

export default router;
