import express from "express";

import {
  createAttraction,
  getAllAttractions,
  getAttractionById,
  updateAttraction,
  deleteAttraction,
  getFeaturedAttractions,
  searchAttractions,
  getAttractionsByCategory,
} from "../controllers/attraction.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

/**
 * @route   POST /api/attractions
 * @desc    Create Attraction
 * @access  Private
 */
router.post(
  "/",
  protect,
  upload.array("images", 5),
  createAttraction
);

/**
 * @route   GET /api/attractions
 * @desc    Get All Attractions
 * @access  Public
 */
router.get("/", getAllAttractions);

/**
 * @route   GET /api/attractions/featured
 * @desc    Get Featured Attractions
 * @access  Public
 */
router.get("/featured", getFeaturedAttractions);

/**
 * @route   GET /api/attractions/search
 * @desc    Search Attractions
 * @access  Public
 */
router.get("/search", searchAttractions);

/**
 * @route   GET /api/attractions/category/:category
 * @desc    Get Attractions By Category
 * @access  Public
 */
router.get("/category/:category", getAttractionsByCategory);

/**
 * @route   GET /api/attractions/:id
 * @desc    Get Attraction By ID
 * @access  Public
 */
router.get("/:id", getAttractionById);

/**
 * @route   PUT /api/attractions/:id
 * @desc    Update Attraction
 * @access  Private
 */
router.put(
  "/:id",
  protect,
  upload.array("images", 5),
  updateAttraction
);

/**
 * @route   DELETE /api/attractions/:id
 * @desc    Delete Attraction
 * @access  Private
 */
router.delete("/:id", protect, deleteAttraction);

export default router;