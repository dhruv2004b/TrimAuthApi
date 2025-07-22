import Otp from '../models/Otp.js';
import sendOTP from '../utils/otpService.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const signup = async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, phone, password: hashedPassword });
    await newUser.save();

    const { otp } = await sendOTP(phone);

    await Otp.create({ phone, otp });

    res.status(201).json({ message: 'Signup successful. OTP sent for verification.' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Signup failed' });
  }
};

export const verifyOtp = async (req, res) => {
  const { phone, otp } = req.body;

  try {
    const record = await Otp.findOne({ phone, otp });

    if (!record) return res.status(400).json({ message: 'Invalid or expired OTP' });

    await Otp.deleteMany({ phone }); // clear OTP after verification
    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'OTP verification failed' });
  }
};

export const login = async (req, res) => {
  const { phoneOrEmail, password } = req.body;

  try {
    const user = await User.findOne({
      $or: [{ email: phoneOrEmail }, { phone: phoneOrEmail }],
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Login failed' });
  }
};
