import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import connectDB from './config/db.js';
import salonRoutes from "./routes/salonRoutes.js";
import timeslotRoutes from "./routes/timeslotRoutes.js";


dotenv.config();

const app = express();

// ✅ Tell Express to trust Render's proxy so rate-limit & req.ip work correctly
app.set('trust proxy', 1);

app.use(express.json());

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use("/api/salons", salonRoutes);
app.use("/api/salons", timeslotRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
