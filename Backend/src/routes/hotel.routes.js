import express from "express";
import {
  createHotel,
  getHotels,
  getHotelById,
  updateHotel,
  deleteHotel,
  searchHotels,
  filterHotels,
} from "../controllers/hotel.controller.js";


import { protect } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

// Create Hotel
router.post(
  "/",
  protect,
  upload.array("images", 5),
  createHotel
);

// Get All Hotels
router.get("/", getHotels);
router.get("/search", searchHotels);

router.get("/filter", filterHotels);
// Get Hotel By ID
router.get("/:id", getHotelById);

// Update Hotel
router.put(
  "/:id",
  protect,
  upload.array("images", 5),
  updateHotel
);

// Delete Hotel
router.delete("/:id", protect, deleteHotel);

export default router;