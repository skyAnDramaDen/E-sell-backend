import { Router } from "express";
import { storage } from "../googleCloud.js";
import {getAllConversations,
    getConversation,
    createConversation,
    getConversationByParticipantsId,
    fetchConversationLastMessage,
    getConversationWithLastMessageById,
    createConversationParticipantsAndMessage
} from "../controllers/conversationController";

const router = Router();

router.post("/get_all_conversations", getAllConversations);

router.post("/get_conversation", getConversation);

router.post("/get_conversation_with_last_message_by_id", getConversationWithLastMessageById);

router.post("/create_conversation_participants_and_message", createConversationParticipantsAndMessage);

router.post("/create_conversation", createConversation);

router.post("/get_conversation_by_participants_id", getConversationByParticipantsId);

router.post("/fetch_conversation_last_message", fetchConversationLastMessage);

export default router;