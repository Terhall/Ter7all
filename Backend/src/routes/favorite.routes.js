import express from "express";

import {
  addToFavorites,
  getFavorites,
  removeFromFavorites,
} from "../controllers/favorite.controller.js";

import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();
router.post("/:attractionId", protect, addToFavorites);
router.get("/", protect, getFavorites);
router.delete("/:attractionId", protect, removeFromFavorites);

export default router;