import express from "express";
import rateLimit from "express-rate-limit";
import { body, validationResult } from "express-validator";
import { addSalon, getSalons } from "../controllers/salonController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

/** ------- Rate limits (per IP) ------- **/
const writeLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 30,                  // max 30 writes per 10 minutes
  standardHeaders: true,
  legacyHeaders: false
});

const readLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 120,                // max 120 reads per minute
  standardHeaders: true,
  legacyHeaders: false
});

/** ------- Validation chains ------- **/
const createSalonValidation = [
  body("name").isString().trim().isLength({ min: 2, max: 120 }).withMessage("name is required"),
  body("address").isString().trim().isLength({ min: 5, max: 240 }).withMessage("address is required"),
  body("priceRange.min").exists().withMessage("priceRange.min is required").bail().isFloat({ min: 0 }),
  body("priceRange.max").exists().withMessage("priceRange.max is required").bail().isFloat({ min: 0 }),
  body("rating").optional().isFloat({ min: 0, max: 10 }),
  body("stylists").optional().isArray().withMessage("stylists must be an array of strings"),
  body("stylists.*").optional().isString().trim().isLength({ min: 1, max: 80 })
];

/** ------- Shared validator handler ------- **/
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  return res.status(400).json({
    message: "Validation error",
    errors: errors.array().map(e => ({ field: e.path, msg: e.msg }))
  });
};

/** ------- Routes ------- **/

// Create a new salon
// Keep this protected (more secure). If you want it public for internal use, remove authMiddleware.
router.post(
  "/",
  authMiddleware,
  writeLimiter,
  createSalonValidation,
  handleValidation,
  addSalon
);

// Get all salons (you had it protected; keeping that to avoid breaking your flow)
// If you want it public for the Flutter app, remove `authMiddleware`.
router.get(
  "/",
  authMiddleware,
  readLimiter,
  getSalons
);

export default router;
