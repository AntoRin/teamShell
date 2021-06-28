import Router from "express";
import jwt from "jsonwebtoken";
import { redisLpushAsync, redisLRangeAsync } from "../redisConfig";
import Project from "../models/Project";

const router = Router();

import AppError from "../utils/AppError";
import { INamedRequest, reqUser } from "../types";

const ROOM_PREFIX = "MeetRoom:";

router.post("/create-room", async (req: INamedRequest, res, next) => {
   const { UniqueUsername } = req.thisUser as reqUser;
   const { projectName, roomName } = req.body;

   try {
      const project = await Project.findOne({
         ProjectName: projectName,
      }).lean();

      if (!project) throw new AppError("BadRequestError");

      if (!project.Members.includes(UniqueUsername))
         throw new AppError("UnauthorizedRequestError");

      const roomId = jwt.sign(
         { projectName, roomName, creator: UniqueUsername },
         process.env.ROOM_JWT_SECRET
      );

      const roomDetails = {
         roomName,
         roomId,
      };

      await redisLpushAsync(
         `${ROOM_PREFIX}${projectName}`,
         JSON.stringify(roomDetails)
      );

      return res.json({ status: "ok", data: roomId });
   } catch (error) {
      return next(error);
   }
});

router.get("/verify-room", async (req: INamedRequest, res, next) => {
   const { UniqueUsername } = req.thisUser as reqUser;
   const roomId = req.query.roomId as string;

   try {
      const { projectName, roomName, creator } = jwt.verify(
         roomId,
         process.env.ROOM_JWT_SECRET
      ) as any;
      const project = await Project.findOne({
         ProjectName: projectName,
      }).lean();

      if (!project) throw new AppError("BadRequestError");

      if (!project.Members.includes(UniqueUsername))
         throw new AppError("UnauthorizedRequestError");

      return res.json({ status: "ok", data: { roomName, creator } });
   } catch (error) {
      return next(error);
   }
});

router.get("/active-rooms/:projectName", async (req, res, next) => {
   const projectName = req.params?.projectName;

   try {
      if (!projectName) throw new AppError("BadRequestError");

      const projectMeetRooms = await redisLRangeAsync(
         `${ROOM_PREFIX}${projectName}`,
         0,
         -1
      );

      if (!projectMeetRooms) throw new AppError("BadRequestError");

      return res.json({ status: "ok", data: projectMeetRooms });
   } catch (error) {
      return next(error);
   }
});

export default router;
