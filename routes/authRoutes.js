import express from 'express';
import { signup, verifyOtp, login, resendOtp } from '../controllers/authController.js'; // ← ADD resendOtp

const router = express.Router();

router.post('/signup', signup);
router.post('/verify-otp', verifyOtp);
router.post('/login', login);
router.post('/resend-otp', resendOtp); // ← ADD this route

export default router;
