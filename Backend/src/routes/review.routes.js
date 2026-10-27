import express from "express";

import {
  createReview,
  getReviews,
  updateReview,
  deleteReview,
} from "../controllers/review.controller.js";

import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Create a review - authenticated users only
router.post("/", protect, createReview);

// Get reviews for a restaurant or hotel - public
router.get("/:type/:id", getReviews);

// Update your own review
router.put("/:id", protect, updateReview);

// Delete your own review
router.delete("/:id", protect, deleteReview);

export default router;