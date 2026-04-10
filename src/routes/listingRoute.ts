import express from "express";
import { createListing, getListing, getAllListings, deleteListing, searchListingsBySearchParams, searchListingsByCategory } from "../controllers/listingController.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.post("/add", upload.array("images", 7), createListing);
router.post("/", getListing);
router.post("/all_listings", getAllListings);
router.post("/delete_listing", deleteListing)
router.post("/search_listings_by_search_params", searchListingsBySearchParams)
router.post("/search_listings_by_category", searchListingsByCategory)

export default router;