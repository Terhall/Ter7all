import Attraction from "../models/attraction.model.js";

/**
 * @desc Create Attraction
 * @route POST /api/attractions
 */
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
    } = req.body;

    const images = req.files
      ? req.files.map((file) => file.path)
      : [];

    const attraction = await Attraction.create({
      name,
      description,
      images,
      category,
      ticketPrice,
      location: {
        country,
        city,
        address,
      },
      coordinates: {
        latitude,
        longitude,
      },
      openingHours: {
        open,
        close,
      },
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Attraction created successfully",
      data: attraction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc Get All Attractions
 * @route GET /api/attractions
 */
export const getAllAttractions = async (req, res) => {
  try {
    const attractions = await Attraction.find()
      .populate("createdBy", "firstName lastName email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: attractions.length,
      data: attractions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc Get Attraction By Id
 * @route GET /api/attractions/:id
 */
export const getAttractionById = async (req, res) => {
  try {
    const attraction = await Attraction.findById(req.params.id).populate(
      "createdBy",
      "firstName lastName email"
    );

    if (!attraction) {
      return res.status(404).json({
        success: false,
        message: "Attraction not found",
      });
    }

    res.status(200).json({
      success: true,
      data: attraction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
/**
 * @desc Update Attraction
 * @route PUT /api/attractions/:id
 */
export const updateAttraction = async (req, res) => {
  try {
    const attraction = await Attraction.findById(req.params.id);

    if (!attraction) {
      return res.status(404).json({
        success: false,
        message: "Attraction not found",
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

    if (req.files && req.files.length > 0) {
      attraction.images = req.files.map((file) => file.path);
    }

    attraction.name = name || attraction.name;
    attraction.description = description || attraction.description;
    attraction.category = category || attraction.category;
    attraction.ticketPrice =
      ticketPrice !== undefined ? ticketPrice : attraction.ticketPrice;

    attraction.location.country =
      country || attraction.location.country;
    attraction.location.city =
      city || attraction.location.city;
    attraction.location.address =
      address || attraction.location.address;

    attraction.coordinates.latitude =
      latitude || attraction.coordinates.latitude;
    attraction.coordinates.longitude =
      longitude || attraction.coordinates.longitude;

    attraction.openingHours.open =
      open || attraction.openingHours.open;
    attraction.openingHours.close =
      close || attraction.openingHours.close;

    if (isFeatured !== undefined) {
      attraction.isFeatured = isFeatured;
    }

    await attraction.save();

    res.status(200).json({
      success: true,
      message: "Attraction updated successfully",
      data: attraction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc Delete Attraction
 * @route DELETE /api/attractions/:id
 */
export const deleteAttraction = async (req, res) => {
  try {
    const attraction = await Attraction.findById(req.params.id);

    if (!attraction) {
      return res.status(404).json({
        success: false,
        message: "Attraction not found",
      });
    }

    await attraction.deleteOne();

    res.status(200).json({
      success: true,
      message: "Attraction deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc Get Featured Attractions
 * @route GET /api/attractions/featured
 */
export const getFeaturedAttractions = async (req, res) => {
  try {
    const attractions = await Attraction.find({
      isFeatured: true,
    });

    res.status(200).json({
      success: true,
      count: attractions.length,
      data: attractions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc Search Attractions
 * @route GET /api/attractions/search
 */
export const searchAttractions = async (req, res) => {
  try {
    const { keyword } = req.query;

    const attractions = await Attraction.find({
      name: {
        $regex: keyword,
        $options: "i",
      },
    });

    res.status(200).json({
      success: true,
      count: attractions.length,
      data: attractions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc Get Attractions By Category
 * @route GET /api/attractions/category/:category
 */
export const getAttractionsByCategory = async (req, res) => {
  try {
    const attractions = await Attraction.find({
      category: req.params.category,
    });

    res.status(200).json({
      success: true,
      count: attractions.length,
      data: attractions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};