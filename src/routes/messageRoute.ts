import { Router } from "express";
import { send_message } from "../controllers/messageController";

const router = Router();

router.post("/send_message", send_message)

export default router;