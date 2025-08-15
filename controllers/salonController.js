import Salon from "../models/Salon.js";

/**
 * POST /api/salons
 * Create a new salon
 */
export const addSalon = async (req, res) => {
  try {
    // Extra server-side hardening in addition to express-validator
    let { name, address, priceRange, rating, stylists } = req.body;

    // Normalize & sanitize
    name = typeof name === "string" ? name.trim() : name;
    address = typeof address === "string" ? address.trim() : address;

    // Coerce numbers safely
    const min = Number(priceRange?.min);
    const max = Number(priceRange?.max);
    const safeRating =
      typeof rating === "number" ? rating : rating !== undefined ? Number(rating) : 0;

    // Stylists -> array of trimmed strings
    if (Array.isArray(stylists)) {
      stylists = stylists
        .filter(v => typeof v === "string")
        .map(v => v.trim())
        .filter(v => v.length > 0);
    } else {
      stylists = [];
    }

    // Extra guards (validator already ran; these prevent bypass)
    if (!name || !address || Number.isNaN(min) || Number.isNaN(max)) {
      return res.status(400).json({ message: "Invalid payload" });
    }
    if (min < 0 || max < 0 || min > max) {
      return res.status(400).json({ message: "priceRange.min must be <= priceRange.max and both >= 0" });
    }
    if (safeRating < 0 || safeRating > 10) {
      return res.status(400).json({ message: "rating must be between 0 and 10" });
    }

    const doc = await Salon.create({
      name,
      address,
      priceRange: { min, max },
      rating: safeRating,
      stylists
    });

    // Return only safe fields
    return res.status(201).json({
      _id: doc._id,
      name: doc.name,
      address: doc.address,
      priceRange: doc.priceRange,
      rating: doc.rating,
      stylists: doc.stylists,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    });
  } catch (err) {
    console.error("Error adding salon:", err);
    return res.status(500).json({ message: "Server error while adding salon" });
  }
};

/**
 * GET /api/salons
 * Get all salons
 */
export const getSalons = async (_req, res) => {
  try {
    // Select only non-sensitive fields, sort newest first
    const salons = await Salon.find({})
      .select("name address priceRange rating stylists createdAt updatedAt")
      .sort({ createdAt: -1 });

    return res.status(200).json(salons);
  } catch (err) {
    console.error("Error fetching salons:", err);
    return res.status(500).json({ message: "Server error while fetching salons" });
  }
};
