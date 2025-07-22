import Otp from '../models/Otp.js';
import sendOTP from '../utils/otpService.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sendSMS from '../utils/otpService.js';

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
  const { phoneOrEmail, password ,rememberMe} = req.body;



  try {
    const user = await User.findOne({
      $or: [{ email: phoneOrEmail }, { phone: phoneOrEmail }],
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: rememberMe ? '30d' : '1d' });

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Login failed' });
  }
};


// resendOtp
export const resendOtp = async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ message: 'Phone number is required' });
  }

  try {
    const otpData = await sendSMS(phone); // API call to 2Factor
    const existingOtp = await Otp.findOne({ phone });

    if (existingOtp) {
      existingOtp.otp = otpData.otp;
      existingOtp.otpId = otpData.otpId;
      existingOtp.createdAt = new Date();
      await existingOtp.save();
    } else {
      await Otp.create({
        phone,
        otp: otpData.otp,
        otpId: otpData.otpId,
      });
    }

    res.status(200).json({ message: 'OTP resent successfully', otp: otpData.otp });
  } catch (error) {
    res.status(500).json({ message: 'Failed to resend OTP', error: error.message });
  }
};