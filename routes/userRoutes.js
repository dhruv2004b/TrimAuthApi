import express from 'express';
import { getProfilePic, getUserById, updateProfilePic } from '../controllers/userController.js';
import verifyToken from '../middlewares/authMiddleware.js';

const router = express.Router();

// Protected route to get user by ID
router.post("/profile-pic", verifyToken, updateProfilePic);
router.get("/profile-pic", verifyToken, getProfilePic);
router.get('/:id', verifyToken, getUserById);

export default router;
