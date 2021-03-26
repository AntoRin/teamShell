const fetch = require("node-fetch");
const { Router } = require("express");

const router = Router();

router.get("/login/github", async (req, res) => {
   return res.redirect(
      `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user`
   );
});

router.get("/login/github/callback", async (req, res) => {
   try {
      let code = req.query.code;
      let body = {
         client_id: process.env.GITHUB_CLIENT_ID,
         client_secret: process.env.GITHUB_CLIENT_SECRET,
         code,
      };

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

      let userEmail = await fetch(`https://api.github.com/user/emails`, {
         headers: { Authorization: `token ${token.access_token}` },
      });

      let emailData = await userEmail.json();
      // console.log(emailData);
      return res
         .cookie("token", token.access_token, {
            httpOnly: true,
         })
         .redirect("http://localhost:3000/user/home");
   } catch (error) {
      return res.json({ status: "error", error });
   }
});

router.get("/verify", (req, res) => {
   let cookies = req.cookies;
   if (cookies.token) return res.json({ status: "ok" });
   else return res.json({ status: "error" });
});

module.exports = router;
