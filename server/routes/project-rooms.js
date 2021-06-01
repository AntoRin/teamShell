const Router = require("express");
const jwt = require("jsonwebtoken");
const { redisHmgetAsync, redisHmsetAsync } = require("../redisConfig");

const router = Router();

const RoomKeyPrefix = "Rooms:";

router.post("/chat-room/create", async (req, res, next) => {
   let { UniqueUsername } = req.thisUser;
   let { projectName, roomName } = req.body;

   try {
      let urlPath = jwt.sign(
         { creator: UniqueUsername, projectName, roomName },
         process.env.ROOM_JWT_SECRET
      );

      let roomData = {
         members: UniqueUsername,
         type: "chat",
         urlPath,
      };

      await redisHmsetAsync(
         `${RoomKeyPrefix}${projectName}:${roomName}`,
         "roomInfo",
         JSON.stringify(roomData)
      );
      return res.json({ status: "ok", data: urlPath });
   } catch (error) {
      console.log(error);
      return next(error);
   }
});

module.exports = router;
