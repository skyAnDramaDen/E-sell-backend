import { Router } from "express";
import prisma from "../config/dbClient.js";
import { storage } from "../googleCloud.js";
import {getAllConversations, getConversation, createConversation, getConversationByParticipantsId} from "../controllers/conversationController";

const router = Router();

router.post("/get_all_conversations", getAllConversations);

router.post("/get_conversation", getConversation);

router.post("/create_conversation", createConversation);

router.post("/get_conversation_by_participants_id", getConversationByParticipantsId);

export default router;