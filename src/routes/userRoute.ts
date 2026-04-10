import express from "express";
import {editUser, getUser, changeUserPassword} from "../controllers/userController.js";
import {upload} from "../middleware/upload.js";

const router = express.Router();

router.post("/edit",upload.array("image", 2), editUser);
router.post("/", getUser);
router.post("/change_user_password", changeUserPassword)

export default router;