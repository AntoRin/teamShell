import bcrypt from "bcryptjs";
import fetch from "node-fetch";
import jwt from "jsonwebtoken";
import { google, Auth } from "googleapis";
import { NextFunction, Response } from "express";
import User from "../models/User";
import { AuthenticatedRequest, TokenPayloadType } from "../types";
import AppError from "../utils/AppError";
import config from "../config";
import validateRegistration from "../utils/validateRegistration";
import ProfileImage from "../models/ProfileImage";
import { ThrowsServiceException } from "../decorators/ServiceException";

class AuthService {
   private static _serviceInstance: AuthService | null = null;
   private _googleClient: Auth.OAuth2Client;

   private constructor() {
      this._googleClient = new google.auth.OAuth2({
         clientId: config.googleClientId,
         clientSecret: config.googleClientSecret,
         redirectUri: config.googleAuthRedirectUri,
      });
      this.loginUserViaGoogle = this.loginUserViaGoogle.bind(this);
      this.handleGoogleLoginCallback =
         this.handleGoogleLoginCallback.bind(this);
   }

   public static get instance(): AuthService {
      if (!this._serviceInstance) this._serviceInstance = new AuthService();

      return this._serviceInstance;
   }

   @ThrowsServiceException
   public async registerUser(req: AuthenticatedRequest, res: Response) {
      const { UniqueUsername, Username, Email, Password } = req.body;

      const hashedPassword = await bcrypt.hash(Password, 10);

      const newUser = new User({
         UniqueUsername,
         Username,
         Email,
         Password: hashedPassword,
         AccountType: "Email",
      });

      await newUser.save();
      res.json({ status: "ok", data: "" });
   }

   @ThrowsServiceException
   public async loginUser(req: AuthenticatedRequest, res: Response) {
      const { Email, Password } = req.body;

      const present = await User.findOne({ Email });

      if (!present || present.AccountType !== "Email")
         throw new AppError("AuthenticationError");

      const verified = await bcrypt.compare(Password, present.Password);
      if (!verified) throw new AppError("AuthenticationError");
      const token = jwt.sign(
         { UniqueUsername: present.UniqueUsername, Email },
         process.env.JWT_SECRET
      );
      return res
         .cookie("token", token, {
            httpOnly: true,
         })
         .json({ status: "ok", data: "" });
   }

   public loginUserViaGitHub(_: AuthenticatedRequest, res: Response) {
      return res.redirect(
         `https://github.com/login/oauth/authorize?client_id=${config.githubClientId}&scope=user`
      );
   }

   @ThrowsServiceException
   public async handleGitHubLoginCallback(
      req: AuthenticatedRequest,
      res: Response
   ) {
      const code = req.query.code;

      const body = {
         client_id: config.githubClientId,
         client_secret: config.githubClientSecret,
         code,
      };

      const tokenStream = await fetch(
         `https://github.com/login/oauth/access_token`,
         {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
               accept: "application/json",
            },
            body: JSON.stringify(body),
         }
      );

      const token = await tokenStream.json();

      const verify = await fetch(`https://api.github.com/user`, {
         headers: { Authorization: `token ${token.access_token}` },
      });

      const userDetails = await verify.json();

      const emailRequest = await fetch(`https://api.github.com/user/emails`, {
         headers: { Authorization: `token ${token.access_token}` },
      });

      const emailData = await emailRequest.json();

      const userInfo = {
         UniqueUsername: userDetails.login,
         Email: emailData[0].email,
      };
      const ImageData = userDetails.avatar_url;

      const present = await validateRegistration(userInfo);

      if (present && present.AccountType !== "GitHub")
         throw new AppError("AuthenticationError");

      const loginToken = jwt.sign(
         { UniqueUsername: userInfo.UniqueUsername, Email: userInfo.Email },
         process.env.JWT_SECRET
      );

      if (present) {
         return res
            .cookie("token", loginToken, { httpOnly: true })
            .redirect("/user/home");
      } else {
         const newUser = new User({
            ...userInfo,
            AccountType: "GitHub",
            Password: "GitHub Verified",
         });
         await newUser.save();

         if (ImageData) {
            const profileImage = new ProfileImage({
               UserContext: userInfo.UniqueUsername,
               ImageData,
            });
            await profileImage.save();
         }

         return res
            .cookie("token", loginToken, {
               httpOnly: true,
            })
            .redirect("/user/home");
      }
   }

   public loginUserViaGoogle(_: AuthenticatedRequest, res: Response) {
      const scopes = [
         "https://www.googleapis.com/auth/userinfo.email",
         "https://www.googleapis.com/auth/userinfo.profile",
         "openid",
      ];

      const authUrl = this._googleClient.generateAuthUrl({
         scope: scopes,
         access_type: "offline",
         include_granted_scopes: true,
      });

      res.redirect(authUrl);
   }

   public async handleGoogleLoginCallback(
      req: AuthenticatedRequest,
      res: Response
   ) {
      if (req.query.error) throw req.query.error;

      const code = req.query.code as string;

      if (!code) throw new AppError("ServerError");

      const { tokens } = await this._googleClient.getToken(code);

      console.log(tokens.scope);

      const getOptions = {
         headers: {
            Authorization: `Bearer ${tokens.access_token}`,
         },
      };

      const userDataStream = await fetch(
         "https://www.googleapis.com/oauth2/v3/userinfo",
         getOptions
      );

      const {
         name: UniqueUsername,
         picture: ImageData,
         email: Email,
      } = await userDataStream.json();

      if (tokens.refresh_token) {
         console.log("Got refToken: ", tokens.refresh_token);
         await User.updateOne(
            { UniqueUsername },
            { GoogleRefreshToken: tokens.refresh_token }
         );
      }

      const present = await validateRegistration({ UniqueUsername, Email });

      if (present && present.AccountType !== "Google")
         throw new AppError("AuthenticationError");

      const loginToken = jwt.sign(
         { UniqueUsername, Email },
         process.env.JWT_SECRET
      );

      if (present) {
         return res
            .cookie("token", loginToken, { httpOnly: true })
            .redirect("/user/home");
      } else {
         const userInfo = {
            UniqueUsername,
            Email,
            Password: "Google Verified",
            AccountType: "Google",
            GoogleRefreshToken: tokens.refresh_token,
         };
         const newUser = new User(userInfo);
         await newUser.save();

         if (ImageData) {
            const profileImage = new ProfileImage({
               UserContext: userInfo.UniqueUsername,
               ImageData,
            });
            await profileImage.save();
         }

         return res
            .cookie("token", loginToken, {
               httpOnly: true,
            })
            .redirect("/user/home");
      }
   }

   public logoutUser(_: AuthenticatedRequest, res: Response) {
      return res
         .cookie("token", "", { httpOnly: true, maxAge: 1 })
         .redirect("/");
   }

   @ThrowsServiceException
   public async verifyUserCreds(
      req: AuthenticatedRequest,
      res: Response,
      _: NextFunction
   ) {
      const token = req.cookies.token;

      const { UniqueUsername, Email } = jwt.verify(
         token,
         process.env.JWT_SECRET
      ) as TokenPayloadType;
      const present = await validateRegistration({ UniqueUsername, Email });
      if (!present) throw new AppError("AuthenticationError");

      return res.json({ status: "ok", User: present });
   }
}

export const authServiceClient: AuthService = AuthService.instance;
