import express from "express";
import { create_listing, get_listing, get_all_listings, delete_listing, search_listings } from "../controllers/listingController.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.post("/add", upload.array("images", 7), create_listing);
router.get("/:id", get_listing);
router.get("/all_listings/:id", get_all_listings);
router.delete("/:id", delete_listing)
router.get("/", search_listings)

export default router;