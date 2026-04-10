import { Router } from "express";
import prisma from "../config/dbClient.js";
import { storage } from "../googleCloud.js";

import { addParticipants } from "../controllers/conversationParticipantController";

const router = Router();

router.post("/add_participants", addParticipants);

export default router;