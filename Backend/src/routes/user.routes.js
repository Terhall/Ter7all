const express = require("express");
const router = express.Router();

const {
  getProfile,
  updateProfile,
  changePassword,
  uploadProfileImage,
  deleteAccount,
} = require("../controllers/user.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

// Get Profile
router.get("/profile", authMiddleware, getProfile);

// Update Profile
router.put("/profile", authMiddleware, updateProfile);

// Change Password
router.put("/change-password", authMiddleware, changePassword);

// Upload Profile Image
router.post(
  "/profile/image",
  authMiddleware,
  upload.single("image"),
  uploadProfileImage
);

// Delete Account
router.delete("/profile", authMiddleware, deleteAccount);

module.exports = router;