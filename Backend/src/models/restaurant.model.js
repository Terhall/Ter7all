import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
    },

    country: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    cuisine: {
      type: String,
      required: true,
    },

    priceRange: {
      type: String,
      enum: ["$", "$$", "$$$"],
      default: "$$",
    },

    images: [
      {
        type: String,
      },
    ],

    latitude: {
      type: Number,
      required: true,
    },

    longitude: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Restaurant = mongoose.model("Restaurant", restaurantSchema);

export default Restaurant;