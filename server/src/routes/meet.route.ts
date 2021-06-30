import Router from "express";
import { meetServiceClient } from "../services/meet.service";

const router = Router();

router.post("/create-room", meetServiceClient.createNewRoom);

router.get("/verify-room", meetServiceClient.verifyRoom);

router.get("/active-rooms/:projectName", meetServiceClient.getActiveRooms);

export default router;
