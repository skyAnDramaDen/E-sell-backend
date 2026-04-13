import express from "express";

import { loginUser, registerUser } from "../controllers/authController.js";
import {loginValidator} from "../middleware/loginValidator";

const router = express.Router();

router.post("/login", loginValidator, loginUser);
router.post("/register", registerUser);

export default router;