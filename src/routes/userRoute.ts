import express from "express";
import {edit_user, get_user} from "../controllers/userController.js";
import {delete_listing} from "../controllers/listingController.js";
import {upload} from "../middleware/upload.js";

const router = express.Router();

router.post("/edit",upload.array("image", 2), edit_user);
router.get("/:id", get_user);

export default router;