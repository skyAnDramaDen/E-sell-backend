import express from "express";
import { create_listing, get_listing, get_all_listings, delete_listing, search_listings_by_search_params, search_listings_by_category } from "../controllers/listingController.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.post("/add", upload.array("images", 7), create_listing);
router.post("/", get_listing);
router.post("/all_listings", get_all_listings);
router.delete("/:id", delete_listing)
router.post("/search_listings_by_search_params", search_listings_by_search_params)
router.post("/search_listings_by_category", search_listings_by_category)

export default router;