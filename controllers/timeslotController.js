import Booking from "../models/Booking.js";
import Salon from "../models/Salon.js";
import dayjs from "dayjs"; 

// Helper: generate slots between 9 AM - 9 PM (20 mins interval)
function generateSlots() {
  const slots = [];
  let start = 9 * 60; // minutes from midnight
  const end = 21 * 60;
  while (start < end) {
    const h = String(Math.floor(start / 60)).padStart(2, "0");
    const m = String(start % 60).padStart(2, "0");
    slots.push(`${h}:${m}`);
    start += 20;
  }
  return slots;
}

// GET available slots
export const getAvailableSlots = async (req, res) => {
  try {
    const { id: salonId } = req.params;
    const { date } = req.query; // YYYY-MM-DD

    if (!date) {
      return res.status(400).json({ message: "date query param required (YYYY-MM-DD)" });
    }

    const salon = await Salon.findById(salonId);
    if (!salon) return res.status(404).json({ message: "Salon not found" });

    const allSlots = generateSlots();

    // Fetch booked slots for this salon + date
    const bookings = await Booking.find({ salonId, date: date.trim() });
    const bookedMap = {};
    bookings.forEach(b => {
      bookedMap[`${b.stylist}_${b.time.padStart(5, "0")}`] = true;
    });

    // Is the date = today?
    const today = dayjs().format("YYYY-MM-DD");
    const isToday = date.trim() === today;
    const now = dayjs();

    // Build response for each stylist
    const result = salon.stylists.map(stylist => ({
      stylist,
      slots: allSlots.map(time => {
        const [hours, minutes] = time.split(":").map(Number);
        const slotTime = dayjs(date).hour(hours).minute(minutes);

        let available = !bookedMap[`${stylist}_${time}`];

        // If it's today and slot already passed → unavailable
        if (isToday && slotTime.isBefore(now)) {
          available = false;
        }

        return { time, available };
      })
    }));

    res.json(result);
  } catch (err) {
    console.error("Error fetching slots:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST book a slot
export const bookSlot = async (req, res) => {
  try {
    const { id: salonId } = req.params;
    let { stylist, date, time } = req.body;
    const userId = req.user.id; // from authMiddleware

    if (!stylist || !date || !time) {
      return res.status(400).json({ message: "stylist, date, and time are required" });
    }

    // Normalize inputs
    stylist = stylist.trim();
    date = date.trim();
    time = time.padStart(5, "0");

    // ---- Validate date range (today + tomorrow only) ----
    const today = dayjs().startOf("day");
    const requestedDate = dayjs(date, "YYYY-MM-DD");

    if (!requestedDate.isValid()) {
      return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD" });
    }

    const diffDays = requestedDate.diff(today, "day");
    if (diffDays < 0 || diffDays > 1) {
      return res.status(400).json({
        message: "You can only book slots for today or tomorrow (48 hours max)"
      });
    }

    // ---- Validate time (no past slots today) ----
    const [hours, minutes] = time.split(":").map(Number);
    const requestedTime = requestedDate.hour(hours).minute(minutes);

    if (requestedTime.isBefore(dayjs())) {
      return res.status(400).json({ message: "Cannot book a past time slot" });
    }

    // ---- Salon validation ----
    const salon = await Salon.findById(salonId);
    if (!salon) return res.status(404).json({ message: "Salon not found" });

    if (!salon.stylists.includes(stylist)) {
      return res.status(400).json({ message: "Stylist not found in this salon" });
    }

    // ---- Booking ----
    const booking = await Booking.create({ salonId, stylist, date, time, userId });

    res.status(201).json({
      message: "Slot booked successfully",
      booking
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Slot already booked" });
    }
    console.error("Error booking slot:", err);
    res.status(500).json({ message: "Server error" });
  }
};
