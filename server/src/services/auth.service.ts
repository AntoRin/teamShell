import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { google } from "googleapis";
import { NextFunction, Response } from "express";
import User from "../models/User";
import { AuthenticatedRequest, TokenPayloadType } from "../types";
import AppError from "../utils/AppError";
import config from "../config";
import validateRegistration from "../utils/validateRegistration";
import ProfileImage from "../models/ProfileImage";

const googleClient = new google.auth.OAuth2({
   clientId: config.googleClientId,
   clientSecret: config.googleClientSecret,
   redirectUri: config.googleAuthRedirectUri,
});

export class AuthService {
   public static async registedUser(
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
   ) {
      try {
         let { UniqueUsername, Username, Email, Password } = req.body;

         let hashedPassword = await bcrypt.hash(Password, 10);

         let newUser = new User({
            UniqueUsername,
            Username,
            Email,
            Password: hashedPassword,
            AccountType: "Email",
         });

         await newUser.save();
         res.json({ status: "ok", data: "" });
      } catch (error) {
         return next(error);
      }
   }

   public static async loginUser(
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
   ) {
      let { Email, Password } = req.body;

      try {
         let present = await User.findOne({ Email });

         if (!present || present.AccountType !== "Email")
            throw new AppError("AuthenticationError");

         let verified = await bcrypt.compare(Password, present.Password);
         if (!verified) throw new AppError("AuthenticationError");
         let token = jwt.sign(
            { UniqueUsername: present.UniqueUsername, Email },
            process.env.JWT_SECRET
         );
         return res
            .cookie("token", token, {
               httpOnly: true,
            })
            .json({ status: "ok", data: "" });
      } catch (error) {
         console.log(error);
         next(error);
      }
   }

   public static loginUserViaGitHub(
      _: AuthenticatedRequest,
      res: Response,
      __: NextFunction
   ) {
      return res.redirect(
         `https://github.com/login/oauth/authorize?client_id=${config.githubClientId}&scope=user`
      );
   }

   public static async handleGitHubLoginCallback(
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
   ) {
      try {
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

         const emailRequest = await fetch(
            `https://api.github.com/user/emails`,
            {
               headers: { Authorization: `token ${token.access_token}` },
            }
         );

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
      } catch (error) {
         return next(error);
      }
   }

   public static loginUserViaGoogle(
      _: AuthenticatedRequest,
      res: Response,
      __: NextFunction
   ) {
      const scopes = [
         "https://www.googleapis.com/auth/userinfo.email",
         "https://www.googleapis.com/auth/userinfo.profile",
         "openid",
      ];

      const authUrl = googleClient.generateAuthUrl({
         scope: scopes,
         access_type: "offline",
         include_granted_scopes: true,
      });

      res.redirect(authUrl);
   }

   public static async handleGoogleLoginCallback(
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
   ) {
      try {
         if (req.query.error) throw req.query.error;

         const code = req.query.code as string;

         if (!code) throw new Error("ServerError");

         const { tokens } = await googleClient.getToken(code);

         console.log(tokens.scope);

         let getOptions = {
            headers: {
               Authorization: `Bearer ${tokens.access_token}`,
            },
         };

         let userDataStream = await fetch(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            getOptions
         );

         let {
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

         let present = await validateRegistration({ UniqueUsername, Email });

         if (present && present.AccountType !== "Google")
            throw new AppError("AuthenticationError");

         let loginToken = jwt.sign(
            { UniqueUsername, Email },
            process.env.JWT_SECRET
         );

         if (present) {
            return res
               .cookie("token", loginToken, { httpOnly: true })
               .redirect("/user/home");
         } else {
            let userInfo = {
               UniqueUsername,
               Email,
               Password: "Google Verified",
               AccountType: "Google",
               GoogleRefreshToken: tokens.refresh_token,
            };
            let newUser = new User(userInfo);
            await newUser.save();

            if (ImageData) {
               let profileImage = new ProfileImage({
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
      } catch (error) {
         console.log(error);
         next(error);
      }
   }

   public static logoutUser(
      _: AuthenticatedRequest,
      res: Response,
      __: NextFunction
   ) {
      return res
         .cookie("token", "", { httpOnly: true, maxAge: 1 })
         .redirect("/");
   }

   public static async verifyUserCreds(
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
   ) {
      let token = req.cookies.token;

      try {
         let { UniqueUsername, Email } = jwt.verify(
            token,
            process.env.JWT_SECRET
         ) as TokenPayloadType;
         let present = await validateRegistration({ UniqueUsername, Email });
         if (!present) throw new AppError("AuthenticationError");

         return res.json({ status: "ok", User: present });
      } catch (error) {
         return next(error);
      }
   }
}
