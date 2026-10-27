import mongoose from "mongoose";

import Review from "../models/review.model.js";
import Attraction from "../models/attraction.model.js";
import Restaurant from "../models/restaurant.model.js";
import Hotel from "../models/hotel.model.js";


const getPlaceModel = (type) => {
  const models = {
    Restaurant,
    Hotel,
    Attraction,
  };

  return models[type] || null;
};


const updatePlaceRating = async (type, placeId) => {
  const PlaceModel = getPlaceModel(type);

  if (!PlaceModel) {
    return;
  }

  const result = await Review.aggregate([
    {
      $match: {
        reviewableModel: type,
        reviewable: new mongoose.Types.ObjectId(
          placeId.toString()
        ),
      },
    },
    {
      $group: {
        _id: null,
        averageRating: {
          $avg: "$rating",
        },
        reviewsCount: {
          $sum: 1,
        },
      },
    },
  ]);

  const averageRating =
    result.length > 0
      ? Number(result[0].averageRating.toFixed(1))
      : 0;

  const reviewsCount =
    result.length > 0
      ? result[0].reviewsCount
      : 0;

  const updateData = {
    averageRating,
    reviewsCount,
  };

  // Keep the old Attraction rating field synchronized
  if (type === "Attraction") {
    updateData.rating = averageRating;
  }

  await PlaceModel.findByIdAndUpdate(placeId, {
    $set: updateData,
  });
};

export const createReview = async (req, res) => {
  try {
    const {
      reviewableModel,
      reviewable,
      rating,
      comment,
    } = req.body;

    const userId = req.user?.id || req.user?._id;

    // Check authentication
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Validate required fields
    if (
      !reviewableModel ||
      !reviewable ||
      rating === undefined ||
      !comment
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Validate place type
    const PlaceModel = getPlaceModel(reviewableModel);

    if (!PlaceModel) {
      return res.status(400).json({
        success: false,
        message:
          "Type must be Restaurant, Hotel, or Attraction",
      });
    }

    // Validate place ID
    if (!mongoose.Types.ObjectId.isValid(reviewable)) {
      return res.status(400).json({
        success: false,
        message: "Invalid place ID",
      });
    }

    // Validate rating
    if (
      !Number.isInteger(Number(rating)) ||
      Number(rating) < 1 ||
      Number(rating) > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer between 1 and 5",
      });
    }

    // Validate comment
    if (
      typeof comment !== "string" ||
      comment.trim().length < 3 ||
      comment.trim().length > 1000
    ) {
      return res.status(400).json({
        success: false,
        message: "Comment must be between 3 and 1000 characters",
      });
    }

    // Check if the place exists
    const place = await PlaceModel.findById(reviewable);

    if (!place) {
      return res.status(404).json({
        success: false,
        message: `${reviewableModel} not found`,
      });
    }

    // Prevent duplicate reviews
    const existingReview = await Review.findOne({
      user: userId,
      reviewableModel,
      reviewable,
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this place",
      });
    }

    // Create review
    const review = await Review.create({
      user: userId,
      reviewableModel,
      reviewable,
      rating: Number(rating),
      comment: comment.trim(),
    });

    // Update place rating
    await updatePlaceRating(
      reviewableModel,
      reviewable
    );

    return res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: review,
    });
  } catch (error) {
    // Handle duplicate review errors
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this place",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================================
// Get Reviews for a Place
// GET /api/reviews/:type/:id
// ========================================
export const getReviews = async (req, res) => {
  try {
    const { type, id } = req.params;

    // Validate place type
    const PlaceModel = getPlaceModel(type);

    if (!PlaceModel) {
      return res.status(400).json({
        success: false,
        message:
          "Type must be Restaurant, Hotel, or Attraction",
      });
    }

    // Validate place ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid place ID",
      });
    }

    // Check if the place exists
    const place = await PlaceModel.findById(id);

    if (!place) {
      return res.status(404).json({
        success: false,
        message: `${type} not found`,
      });
    }

    // Get reviews
    const reviews = await Review.find({
      reviewableModel: type,
      reviewable: id,
    })
      .populate("user", "fullName email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      totalReviews: place.reviewsCount ?? 0,
      averageRating: place.averageRating ?? place.rating ?? 0,
      data: reviews,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================================
// Update Review
// PUT /api/reviews/:id
// ========================================
export const updateReview = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { rating, comment } = req.body;

    // Check authentication
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Validate review ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    // Find review
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Check ownership
    if (review.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own reviews",
      });
    }

    // Check if any field was provided
    if (rating === undefined && comment === undefined) {
      return res.status(400).json({
        success: false,
        message: "Provide a rating or comment to update",
      });
    }

    // Validate and update rating
    if (rating !== undefined) {
      if (
        !Number.isInteger(Number(rating)) ||
        Number(rating) < 1 ||
        Number(rating) > 5
      ) {
        return res.status(400).json({
          success: false,
          message: "Rating must be an integer between 1 and 5",
        });
      }

      review.rating = Number(rating);
    }

    // Validate and update comment
    if (comment !== undefined) {
      if (
        typeof comment !== "string" ||
        comment.trim().length < 3 ||
        comment.trim().length > 1000
      ) {
        return res.status(400).json({
          success: false,
          message: "Comment must be between 3 and 1000 characters",
        });
      }

      review.comment = comment.trim();
    }

    // Save changes
    await review.save();

    // Recalculate place rating
    await updatePlaceRating(
      review.reviewableModel,
      review.reviewable
    );

    return res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: review,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================================
// Delete Review
// DELETE /api/reviews/:id
// ========================================
export const deleteReview = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    // Check authentication
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Validate review ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    // Find review
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Check ownership
    if (review.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own reviews",
      });
    }

    // Save place information before deleting
    const { reviewableModel, reviewable } = review;

    // Delete review
    await review.deleteOne();

    // Recalculate place rating
    await updatePlaceRating(
      reviewableModel,
      reviewable
    );

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};