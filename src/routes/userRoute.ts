import express from "express";
import {edit_user} from "../controllers/userController.js";

const router = express.Router();

router.post("/edit", edit_user);

export default router;