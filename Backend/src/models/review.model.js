import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reviewableModel: {
      type: String,
      required: true,
      enum: ["Restaurant", "Hotel", "Attraction"],
    },

    reviewable: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "reviewableModel",
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: "Rating must be an integer between 1 and 5",
      },
    },

    comment: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate reviews by the same user
reviewSchema.index(
  {
    user: 1,
    reviewableModel: 1,
    reviewable: 1,
  },
  {
    unique: true,
  }
);

const Review = mongoose.model("Review", reviewSchema);

export default Review;