import { Router } from "express";
import prisma from "../config/dbClient.js";
import { storage } from "../googleCloud.js";
import {get_all_conversations, get_conversation, create_conversation, get_conversation_by_participants_id} from "../controllers/conversationController";

const router = Router();

router.post("/get_all_conversations", get_all_conversations);

router.post("/get_conversation", get_conversation);

router.post("/create_conversation", create_conversation);

router.post("/get_conversation_by_participants_id", get_conversation_by_participants_id);

export default router;