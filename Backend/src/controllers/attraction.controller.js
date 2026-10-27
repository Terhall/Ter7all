import mongoose from "mongoose";
import Attraction from "../models/attraction.model.js";

// ========================================
// Helper: Validate MongoDB ObjectId
// ========================================
const isValidId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// ========================================
// Helper: Check Ownership or Admin
// ========================================
const canModifyAttraction = (attraction, user) => {
  if (!user) return false;

  const isAdmin = user.role === "admin";

  const isOwner =
    attraction.createdBy &&
    attraction.createdBy.toString() === user.id?.toString();

  return isAdmin || isOwner;
};

// ========================================
// Create Attraction
// POST /api/attractions
// ========================================
export const createAttraction = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      ticketPrice,
      country,
      city,
      address,
      latitude,
      longitude,
      open,
      close,
      isFeatured,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !description ||
      !category ||
      !country ||
      !city ||
      !address ||
      latitude === undefined ||
      longitude === undefined ||
      !open ||
      !close
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Ensure user is authenticated
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Validate coordinates
    const lat = Number(latitude);
    const lng = Number(longitude);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid latitude or longitude",
      });
    }

    // Validate ticket price
    const price =
      ticketPrice === undefined || ticketPrice === ""
        ? 0
        : Number(ticketPrice);

    if (!Number.isFinite(price) || price < 0) {
      return res.status(400).json({
        success: false,
        message: "Ticket price must be a non-negative number",
      });
    }

    // Upload images
    const images = req.files
      ? req.files.map((file) => file.path)
      : [];

    // Create attraction
    const attraction = await Attraction.create({
      name,
      description,
      images,
      category,
      ticketPrice: price,

      location: {
        country,
        city,
        address,
      },

      coordinates: {
        latitude: lat,
        longitude: lng,
      },

      openingHours: {
        open,
        close,
      },

      isFeatured:
        isFeatured === true || isFeatured === "true",

      createdBy: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Attraction created successfully",
      data: attraction,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create attraction",
      error: error.message,
    });
  }
};

// ========================================
// Get All Attractions
// GET /api/attractions
// ========================================
export const getAllAttractions = async (req, res) => {
  try {
    const attractions = await Attraction.find()
      .populate("createdBy", "fullName email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: attractions.length,
      data: attractions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch attractions",
      error: error.message,
    });
  }
};

// ========================================
// Get Attraction By ID
// GET /api/attractions/:id
// ========================================
export const getAttractionById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attraction ID",
      });
    }

    const attraction = await Attraction.findById(id)
      .populate("createdBy", "fullName email");

    if (!attraction) {
      return res.status(404).json({
        success: false,
        message: "Attraction not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: attraction,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch attraction",
      error: error.message,
    });
  }
};

// ========================================
// Update Attraction
// PUT /api/attractions/:id
// ========================================
export const updateAttraction = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attraction ID",
      });
    }

    const attraction = await Attraction.findById(id);

    if (!attraction) {
      return res.status(404).json({
        success: false,
        message: "Attraction not found",
      });
    }

    // Check ownership or admin permission
    if (!canModifyAttraction(attraction, req.user)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to modify this attraction",
      });
    }

    const {
      name,
      description,
      category,
      ticketPrice,
      country,
      city,
      address,
      latitude,
      longitude,
      open,
      close,
      isFeatured,
    } = req.body;

    // Update basic fields
    if (name !== undefined) {
      attraction.name = name;
    }

    if (description !== undefined) {
      attraction.description = description;
    }

    if (category !== undefined) {
      attraction.category = category;
    }

    // Update ticket price
    if (ticketPrice !== undefined && ticketPrice !== "") {
      const price = Number(ticketPrice);

      if (!Number.isFinite(price) || price < 0) {
        return res.status(400).json({
          success: false,
          message: "Ticket price must be a non-negative number",
        });
      }

      attraction.ticketPrice = price;
    }

    // Update location
    if (country !== undefined) {
      attraction.location.country = country;
    }

    if (city !== undefined) {
      attraction.location.city = city;
    }

    if (address !== undefined) {
      attraction.location.address = address;
    }

    // Update latitude
    if (latitude !== undefined && latitude !== "") {
      const lat = Number(latitude);

      if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
        return res.status(400).json({
          success: false,
          message: "Invalid latitude",
        });
      }

      attraction.coordinates.latitude = lat;
    }

    // Update longitude
    if (longitude !== undefined && longitude !== "") {
      const lng = Number(longitude);

      if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
        return res.status(400).json({
          success: false,
          message: "Invalid longitude",
        });
      }

      attraction.coordinates.longitude = lng;
    }

    // Update opening hours
    if (open !== undefined) {
      attraction.openingHours.open = open;
    }

    if (close !== undefined) {
      attraction.openingHours.close = close;
    }

    // Update featured status
    if (isFeatured !== undefined) {
      if (
        isFeatured === true ||
        isFeatured === "true"
      ) {
        attraction.isFeatured = true;
      } else if (
        isFeatured === false ||
        isFeatured === "false"
      ) {
        attraction.isFeatured = false;
      } else {
        return res.status(400).json({
          success: false,
          message: "isFeatured must be true or false",
        });
      }
    }

    // Replace images if new images were uploaded
    if (req.files && req.files.length > 0) {
      attraction.images = req.files.map((file) => file.path);
    }

    await attraction.save();

    return res.status(200).json({
      success: true,
      message: "Attraction updated successfully",
      data: attraction,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update attraction",
      error: error.message,
    });
  }
};

// ========================================
// Delete Attraction
// DELETE /api/attractions/:id
// ========================================
export const deleteAttraction = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attraction ID",
      });
    }

    const attraction = await Attraction.findById(id);

    if (!attraction) {
      return res.status(404).json({
        success: false,
        message: "Attraction not found",
      });
    }

    // Check ownership or admin permission
    if (!canModifyAttraction(attraction, req.user)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this attraction",
      });
    }

    await attraction.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Attraction deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete attraction",
      error: error.message,
    });
  }
};

// ========================================
// Get Featured Attractions
// GET /api/attractions/featured
// ========================================
export const getFeaturedAttractions = async (req, res) => {
  try {
    const attractions = await Attraction.find({
      isFeatured: true,
    })
      .populate("createdBy", "fullName email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: attractions.length,
      data: attractions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch featured attractions",
      error: error.message,
    });
  }
};

// ========================================
// Search Attractions
// GET /api/attractions/search?keyword=cairo
// ========================================
export const searchAttractions = async (req, res) => {
  try {
    const { keyword } = req.query;

    if (
      typeof keyword !== "string" ||
      !keyword.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a search keyword",
      });
    }

    // Escape special regex characters
    const escapedKeyword = keyword.trim().replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    const attractions = await Attraction.find({
      name: {
        $regex: escapedKeyword,
        $options: "i",
      },
    })
      .populate("createdBy", "fullName email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: attractions.length,
      data: attractions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to search attractions",
      error: error.message,
    });
  }
};

// ========================================
// Get Attractions By Category
// GET /api/attractions/category/:category
// ========================================
export const getAttractionsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const attractions = await Attraction.find({
      category,
    })
      .populate("createdBy", "fullName email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: attractions.length,
      data: attractions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch attractions by category",
      error: error.message,
    });
  }
};