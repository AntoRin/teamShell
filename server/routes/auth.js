const fetch = require("node-fetch");
const { Router } = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const validateRegistration = require("../utils/validateRegistration");

const router = Router();

router.get("/login/github", async (req, res) => {
   return res.redirect(
      `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user`
   );
});

router.get("/login/github/callback", async (req, res) => {
   let code = req.query.code;
   let body = {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
   };

   try {
      let tokenReq = await fetch(
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

      let token = await tokenReq.json();

      let verify = await fetch(`https://api.github.com/user`, {
         headers: { Authorization: `token ${token.access_token}` },
      });

      let userDetails = await verify.json();
      // console.log(userDetails);

      let emailRequest = await fetch(`https://api.github.com/user/emails`, {
         headers: { Authorization: `token ${token.access_token}` },
      });

      let emailData = await emailRequest.json();
      // console.log(emailData);

      let userInfo = {
         UniqueUsername: userDetails.login,
         Email: emailData[0].email,
         ProfileImage: userDetails.avatar_url,
         Password: "GitHub Verified",
      };

      let present = await validateRegistration(userInfo, User);

      let loginToken = jwt.sign(
         { UniqueUsername: userInfo.UniqueUsername, Email: userInfo.Email },
         process.env.JWT_SECRET
      );

      if (present) {
         return res
            .cookie("token", loginToken, { httpOnly: true })
            .redirect("http://localhost:3000/user/home");
      } else {
         let newUser = new User(userInfo);
         await newUser.save();
         return res
            .cookie("token", loginToken, {
               httpOnly: true,
            })
            .redirect("http://localhost:3000/user/home");
      }
   } catch (error) {
      console.log(error.type);
      return res.json({ status: "error", error: error.message });
   }
});

router.get("/logout", (req, res) => {
   return res
      .cookie("token", "", { httpOnly: true, maxAge: 1 })
      .redirect("http://localhost:3000/");
});

router.get("/verify", async (req, res) => {
   let token = req.cookies.token;

   try {
      let { UniqueUsername, Email } = jwt.verify(token, process.env.JWT_SECRET);
      let present = await validateRegistration({ UniqueUsername, Email }, User);
      if (!present) throw "Invalid Credentials";
      return res.json({ status: "ok", User: present });
   } catch (error) {
      return res.json({ status: error, error: error });
   }
});

module.exports = router;
