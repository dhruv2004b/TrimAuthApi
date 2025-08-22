import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  salonId: { type: mongoose.Schema.Types.ObjectId, ref: "Salon", required: true },
  stylist: { type: String, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  time: { type: String, required: true }, // HH:mm
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now, expires: 28 * 24 * 60 * 60 } // ⏳ TTL = 28 days
}, { timestamps: true });

// Prevent double-booking
bookingSchema.index({ salonId: 1, stylist: 1, date: 1, time: 1 }, { unique: true });

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
