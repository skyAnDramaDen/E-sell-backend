import express from "express";

import { login_user, register_user } from "../controllers/authController";

const router = express.Router();

console.log("I am reaching the router");

router.post("/login", login_user);
router.post("/register", register_user);

export default router;