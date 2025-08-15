import mongoose from "mongoose";

const salonSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    priceRange: {
      min: { type: Number, required: true },
      max: { type: Number, required: true }
    },
    rating: { type: Number, default: 0, min: 0, max: 10 },
    stylists: { type: [String], default: [] }
  },
  { timestamps: true }
);

export default mongoose.model("Salon", salonSchema);