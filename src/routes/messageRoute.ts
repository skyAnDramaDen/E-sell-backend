import { Router } from "express";
import prisma from "../config/dbClient.js";
import { storage } from "../googleCloud.js";
import { send_message } from "../controllers/messageController";

const router = Router();


router.post("/send_message", send_message)

export default router;