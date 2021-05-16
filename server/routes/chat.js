const crypto = require("crypto");
const { Router } = require("express");
const router = Router();
const Chat = require("../models/Chat");

router.get("/all-messages", async (req, res, next) => {
   let { User1, User2 } = req.query;
   let sorter = [User1, User2];
   sorter.sort();
   let ChatID = sorter[0] + sorter[1];

   try {
      let chat = await Chat.findOne({ ChatID });

      return chat
         ? res.json({ status: "ok", data: chat })
         : res.json({ status: "ok", data: [] });
   } catch (error) {
      console.log(error);
      return next(error);
   }
});

module.exports = router;
