import { RestController, GET, POST, Factory } from "express-frills";
import { authServiceClient } from "../services/auth.service";

@RestController("/api/auth")
export class AuthController {
   private static _controllerInstance: AuthController | null = null;

   private constructor() {}

   public static get controllerInstance() {
      if (!this._controllerInstance) this._controllerInstance = new AuthController();

      return this._controllerInstance;
   }

   @POST("/register")
   @Factory
   registerUser() {
      return authServiceClient.registerUser;
   }

   @POST("/login")
   @Factory
   loginUser() {
      return authServiceClient.loginUser;
   }

   @GET("/login/github")
   @Factory
   loginUserViaGitHub() {
      return authServiceClient.loginUserViaGitHub;
   }

   @GET("/login/github/callback")
   @Factory
   handleGitHubLoginCallback() {
      return authServiceClient.handleGitHubLoginCallback;
   }

   @GET("/login/google")
   @Factory
   loginUserViaGoogle() {
      return authServiceClient.loginUserViaGoogle;
   }

   @GET("/login/google/callback")
   @Factory
   handleGoogleLoginCallback() {
      return authServiceClient.handleGoogleLoginCallback;
   }

   @GET("/logout")
   @Factory
   logoutUser() {
      return authServiceClient.logoutUser;
   }

   @GET("/verify")
   @Factory
   verifyCreds() {
      return authServiceClient.verifyUserCreds;
   }
}
