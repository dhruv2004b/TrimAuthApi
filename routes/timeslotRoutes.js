import express from "express";
import { getAvailableSlots, bookSlot } from "../controllers/timeslotController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Get available slots for a salon (protected)
router.get("/:id/timeslots", authMiddleware, getAvailableSlots);

// Book a slot (protected)
router.post("/:id/book", authMiddleware, bookSlot);

export default router;
