import { Router } from "express";
import { GET, POST } from "../decorators/RestController";
import { authServiceClient } from "../services/auth.service";

class AuthController {
   private static _controllerInstance: AuthController | null = null;
   private static router = Router();

   private constructor() {}

   public static get controllerInstance() {
      if (!this._controllerInstance)
         this._controllerInstance = new AuthController();

      return this._controllerInstance;
   }

   get routerInstance() {
      return AuthController.router;
   }

   @POST("/register")
   registerUser() {
      return authServiceClient.registerUser;
   }

   @POST("/login")
   loginUser() {
      return authServiceClient.loginUser;
   }

   @GET("/login/github")
   loginUserViaGitHub() {
      return authServiceClient.loginUserViaGitHub;
   }

   @GET("/login/github/callback")
   handleGitHubLoginCallback() {
      return authServiceClient.handleGitHubLoginCallback;
   }

   @GET("/login/google")
   loginUserViaGoogle() {
      return authServiceClient.loginUserViaGoogle;
   }

   @GET("/login/google/callback")
   handleGoogleLoginCallback() {
      return authServiceClient.handleGoogleLoginCallback;
   }

   @GET("/logout")
   logoutUser() {
      return authServiceClient.logoutUser;
   }

   @GET("/verify")
   verifyCreds() {
      return authServiceClient.verifyUserCreds;
   }
}

export default AuthController.controllerInstance.routerInstance;
