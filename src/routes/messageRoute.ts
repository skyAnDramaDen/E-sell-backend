import { Router } from "express";
import { sendMessage } from "../controllers/messageController";

const router = Router();

router.post("/send_message", sendMessage)

export default router;