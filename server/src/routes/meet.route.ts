import Router from "express";
import { MeetService } from "../services/meet.service";

const router = Router();

router.post("/create-room", MeetService.createNewRoom);

router.get("/verify-room", MeetService.verifyRoom);

router.get("/active-rooms/:projectName", MeetService.getActiveRooms);

export default router;
