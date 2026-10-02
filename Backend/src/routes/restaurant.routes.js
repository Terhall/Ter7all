import express from "express";
import {
  createRestaurant,
  getRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
  searchRestaurants,
  filterRestaurants,
} from "../controllers/restaurant.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

router.post("/", protect, upload.array("images", 5), createRestaurant);

router.get("/", getRestaurants);
router.get("/search", searchRestaurants);
router.get("/filter", filterRestaurants);
router.get("/:id", getRestaurantById);

router.put("/:id", protect, upload.array("images", 5), updateRestaurant);

router.delete("/:id", protect, deleteRestaurant);

export default router;