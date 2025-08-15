import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import connectDB from './config/db.js';
import salonRoutes from "./routes/salonRoutes.js";



dotenv.config();

const app = express();
app.use(express.json());

connectDB();
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use("/api/salons", salonRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

