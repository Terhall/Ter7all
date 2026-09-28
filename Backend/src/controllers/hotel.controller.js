import Hotel from "../models/hotel.model.js";
import cloudinary from "../config/cloudinary.js";

// Create Hotel
export const createHotel = async (req, res) => {
  try {
    let imageUrls = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "Hotels",
        });

        imageUrls.push(result.secure_url);
      }
    }

    const hotel = await Hotel.create({
      ...req.body,
      images: imageUrls,
    });

    res.status(201).json({
      success: true,
      data: hotel,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Hotels
export const getHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find();

    res.status(200).json({
      success: true,
      count: hotels.length,
      data: hotels,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Search Hotels
export const searchHotels = async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: "Keyword is required",
      });
    }

    const hotels = await Hotel.find({
      name: { $regex: keyword, $options: "i" },
    });

    res.status(200).json({
      success: true,
      count: hotels.length,
      data: hotels,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Filter Hotels
export const filterHotels = async (req, res) => {
  try {
    const { city, stars, minPrice, maxPrice } = req.query;

    let filter = {};

    if (city) {
      filter.city = city;
    }

    if (stars) {
      filter.stars = Number(stars);
    }

    if (minPrice || maxPrice) {
      filter.pricePerNight = {};

      if (minPrice) {
        filter.pricePerNight.$gte = Number(minPrice);
      }

      if (maxPrice) {
        filter.pricePerNight.$lte = Number(maxPrice);
      }
    }

    const hotels = await Hotel.find(filter);

    res.status(200).json({
      success: true,
      count: hotels.length,
      data: hotels,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Hotel By ID
export const getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    res.status(200).json({
      success: true,
      data: hotel,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Hotel
export const updateHotel = async (req, res) => {
  try {
    let imageUrls = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "Hotels",
        });

        imageUrls.push(result.secure_url);
      }

      req.body.images = imageUrls;
    }

    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    res.status(200).json({
      success: true,
      data: hotel,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Hotel
export const deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Hotel deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};