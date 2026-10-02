import mongoose from "mongoose";

const attractionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Attraction name is required"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },

    images: [
      {
        type: String,
      },
    ],

    category: {
      type: String,
      enum: [
        "Historical",
        "Museum",
        "Religious",
        "Beach",
        "Nature",
        "Entertainment",
        "Adventure",
      ],
      required: [true, "Category is required"],
    },

    location: {
      country: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
    },

    coordinates: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
    },

    ticketPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    openingHours: {
      open: {
        type: String,
        required: true,
      },
      close: {
        type: String,
        required: true,
      },
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Attraction = mongoose.model("Attraction", attractionSchema);

export default Attraction;