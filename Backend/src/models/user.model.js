const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false, // إخفاء الباسورد تلقائياً
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    profileImage: {
      type: String,
      default: "",
    },

    dateOfBirth: {
      type: Date,
    },

    gender: {
      type: String,
      enum: ["Male", "Female"],
    },

    nationality: {
      type: String,
      default: "",
      trim: true,
    },

    bio: {
      type: String,
      maxlength: 300,
      default: "",
      trim: true,
    },

    preferredLanguage: {
      type: String,
      default: "English",
    },

    currency: {
      type: String,
      default: "USD",
    },

    travelStyle: {
      type: String,
      enum: [
        "Adventure",
        "Luxury",
        "Family",
        "Historical",
        "Beach",
        "Nature",
      ],
      default: "Historical",
    },

    budgetRange: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    role: {
      type: String,
      enum: ["tourist", "agency", "admin"],
      default: "tourist",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// إخفاء الحقول الحساسة عند تحويل البيانات إلى JSON
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

module.exports = mongoose.model("User", userSchema);