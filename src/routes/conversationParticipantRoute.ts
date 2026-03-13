import { Router } from "express";
import prisma from "../config/dbClient.js";
import { storage } from "../googleCloud.js";

import { add_participants } from "../controllers/conversationParticipantController";

const router = Router();

router.post("/add_participants", add_participants);

export default router;