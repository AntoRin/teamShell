import { Response } from "express";
import { Component } from "express-frills";
import jwt from "jsonwebtoken";
import { ThrowsServiceException } from "../decorators/ServiceException";
import Project from "../models/Project";
import { redisLpushAsync, redisLRangeAsync } from "../redisConfig";
import { AuthenticatedRequest, RequestUserType } from "../types";
import AppError from "../utils/AppError";

@Component()
export class MeetService {
   private readonly ROOM_PREFIX: string = "MeetRoom:";

   public constructor() {
      this.createNewRoom = this.createNewRoom.bind(this);
      this.getActiveRooms = this.getActiveRooms.bind(this);
   }

   @ThrowsServiceException
   public async createNewRoom(req: AuthenticatedRequest, res: Response) {
      const { UniqueUsername } = req.thisUser as RequestUserType;
      const { projectName, roomName } = req.body;

      const project = await Project.findOne({
         ProjectName: projectName,
      }).lean();

      if (!project) throw new AppError("BadRequestError");

      if (!project.Members.includes(UniqueUsername)) throw new AppError("UnauthorizedRequestError");

      const roomId = jwt.sign({ projectName, roomName, creator: UniqueUsername }, process.env.ROOM_JWT_SECRET!);

      const roomDetails = {
         roomName,
         roomId,
      };

      await redisLpushAsync(`${this.ROOM_PREFIX}${projectName}`, JSON.stringify(roomDetails));

      return res.json({ status: "ok", data: roomId });
   }

   @ThrowsServiceException
   public async verifyRoom(req: AuthenticatedRequest, res: Response) {
      const { UniqueUsername } = req.thisUser as RequestUserType;
      const roomId = req.query.roomId as string;

      const { projectName, roomName, creator } = jwt.verify(roomId, process.env.ROOM_JWT_SECRET!) as any;
      const project = await Project.findOne({
         ProjectName: projectName,
      }).lean();

      if (!project) throw new AppError("BadRequestError");

      if (!project.Members.includes(UniqueUsername)) throw new AppError("UnauthorizedRequestError");

      return res.json({ status: "ok", data: { roomName, creator } });
   }

   @ThrowsServiceException
   public async getActiveRooms(req: AuthenticatedRequest, res: Response) {
      const projectName = req.params?.projectName;

      if (!projectName) throw new AppError("BadRequestError");

      const projectMeetRooms = await redisLRangeAsync(`${this.ROOM_PREFIX}${projectName}`, 0, -1);

      if (!projectMeetRooms) throw new AppError("BadRequestError");

      return res.json({ status: "ok", data: projectMeetRooms });
   }
}
