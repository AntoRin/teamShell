import { RestController, GET, POST, Factory } from "dipress";
import { AuthService } from "../services/auth.service";

@RestController("/api/auth")
export class AuthController {
   public constructor(private _authServiceClient: AuthService) {}

   @POST("/register")
   @Factory
   registerUser() {
      return this._authServiceClient.registerUser;
   }

   @POST("/login")
   @Factory
   loginUser() {
      return this._authServiceClient.loginUser;
   }

   @GET("/login/github")
   @Factory
   loginUserViaGitHub() {
      return this._authServiceClient.loginUserViaGitHub;
   }

   @GET("/login/github/callback")
   @Factory
   handleGitHubLoginCallback() {
      return this._authServiceClient.handleGitHubLoginCallback;
   }

   @GET("/login/google")
   @Factory
   loginUserViaGoogle() {
      return this._authServiceClient.loginUserViaGoogle;
   }

   @GET("/login/google/callback")
   @Factory
   handleGoogleLoginCallback() {
      return this._authServiceClient.handleGoogleLoginCallback;
   }

   @GET("/logout")
   @Factory
   logoutUser() {
      return this._authServiceClient.logoutUser;
   }

   @GET("/verify")
   @Factory
   verifyCreds() {
      return this._authServiceClient.verifyUserCreds;
   }
}
