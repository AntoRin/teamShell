const Router = require("express");
const jwt = require("jsonwebtoken");
const Project = require("../models/Project");

const router = Router();

router.post("/create-room", async (req, res, next) => {
   let { UniqueUsername } = req.thisUser;
   let { projectName, roomName } = req.body;

   try {
      let project = await Project.findOne({ ProjectName: projectName }).lean();

      if (!project) throw { name: "UnknownData" };

      if (!project.Members.includes(UniqueUsername))
         throw { name: "UnauthorizedRequest" };

      let roomId = jwt.sign(
         { projectName, roomName, creator: UniqueUsername },
         process.env.ROOM_JWT_SECRET
      );

      return res.json({ status: "ok", data: roomId });
   } catch (error) {
      return next(error);
   }
});

router.get("/verify-room", async (req, res, next) => {
   let { UniqueUsername } = req.thisUser;
   let roomId = req.query.roomId;

   try {
      let { projectName, roomName, creator } = jwt.verify(
         roomId,
         process.env.ROOM_JWT_SECRET
      );
      let project = await Project.findOne({ ProjectName: projectName }).lean();

      if (!project) throw { name: "UnknownData" };

      if (!project.Members.includes(UniqueUsername))
         throw { name: "UnauthorizedRequest" };

      return res.json({ status: "ok", data: roomName });
   } catch (error) {
      return next(error);
   }
});

module.exports = router;
