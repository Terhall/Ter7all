import Favorite from "../models/favorite.model.js";
import Attraction from "../models/attraction.model.js";

// Add to Favorites
export const addToFavorites = async (req, res) => {
  try {
    const { attractionId } = req.params;

    const attraction = await Attraction.findById(attractionId);

    if (!attraction) {
      return res.status(404).json({
        success: false,
        message: "Attraction not found",
      });
    }

    const favoriteExists = await Favorite.findOne({
      user: req.user.id,
      attraction: attractionId,
    });

    if (favoriteExists) {
      return res.status(400).json({
        success: false,
        message: "Attraction already in favorites",
      });
    }

    const favorite = await Favorite.create({
      user: req.user.id,
      attraction: attractionId,
    });

    res.status(201).json({
      success: true,
      message: "Added to favorites",
      data: favorite,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get User Favorites
export const getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({
      user: req.user.id,
    }).populate("attraction");

    res.status(200).json({
      success: true,
      count: favorites.length,
      data: favorites,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Remove from Favorites
export const removeFromFavorites = async (req, res) => {
  try {
    const { attractionId } = req.params;

    const favorite = await Favorite.findOneAndDelete({
      user: req.user.id,
      attraction: attractionId,
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: "Favorite not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Removed from favorites",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};