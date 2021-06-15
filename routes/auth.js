const fetch = require("node-fetch");
const { Router } = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { google } = require("googleapis");

const User = require("../models/User");
const ProfileImage = require("../models/ProfileImage");
const validateRegistration = require("../utils/validateRegistration");

const config = require("../config");

const router = Router();

const googleClient = new google.auth.OAuth2({
   clientId: process.env.GOOGLE_CLIENT_ID,
   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
   redirectUri: "http://localhost:5000/api/auth/login/google/callback",
});

const AppError = require("../utils/AppError");

router.post("/register", async (req, res, next) => {
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
});

router.post("/login", async (req, res, next) => {
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
});

//GitHub Login
router.get("/login/github", async (req, res) => {
   return res.redirect(
      `https://github.com/login/oauth/authorize?client_id=${config.githubClientId}&scope=user`
   );
});

router.get("/login/github/callback", async (req, res, next) => {
   try {
      let code = req.query.code;
      let body = {
         client_id: config.githubClientId,
         client_secret: config.githubClientSecret,
         code,
      };

      let tokenStream = await fetch(
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

      let token = await tokenStream.json();

      let verify = await fetch(`https://api.github.com/user`, {
         headers: { Authorization: `token ${token.access_token}` },
      });

      let userDetails = await verify.json();

      let emailRequest = await fetch(`https://api.github.com/user/emails`, {
         headers: { Authorization: `token ${token.access_token}` },
      });

      let emailData = await emailRequest.json();

      let userInfo = {
         UniqueUsername: userDetails.login,
         Email: emailData[0].email,
      };
      let ImageData = userDetails.avatar_url;

      let present = await validateRegistration(userInfo);

      if (present && present.AccountType !== "GitHub")
         throw new AppError("AuthenticationError");

      let loginToken = jwt.sign(
         { UniqueUsername: userInfo.UniqueUsername, Email: userInfo.Email },
         process.env.JWT_SECRET
      );

      if (present) {
         return res
            .cookie("token", loginToken, { httpOnly: true })
            .redirect("/user/home");
      } else {
         let newUser = new User({
            ...userInfo,
            AccountType: "GitHub",
            Password: "GitHub Verified",
         });
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
      return next(error);
   }
});

//Google login
router.get("/login/google", async (req, res, next) => {
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
});

router.get("/login/google/callback", async (req, res, next) => {
   try {
      if (req.query.error) throw req.query.error;

      const code = req.query.code;
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
});

router.get("/logout", (req, res) => {
   return res.cookie("token", "", { httpOnly: true, maxAge: 1 }).redirect("/");
});

router.get("/verify", async (req, res, next) => {
   let token = req.cookies.token;

   try {
      let { UniqueUsername, Email } = jwt.verify(token, process.env.JWT_SECRET);
      let present = await validateRegistration({ UniqueUsername, Email });
      if (!present) throw new AppError("AuthenticationError");

      return res.json({ status: "ok", User: present });
   } catch (error) {
      return next(error);
   }
});

module.exports = router;
