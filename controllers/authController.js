import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'; 


const createToken = (id, rememberMe = false) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: rememberMe ? '30d' : '1d',
  });
};

export const signupUser = async (req, res) => {
  try {
    const { name, phone, email, password, repassword } = req.body;

    if ([name, phone, email, password, repassword].some(field => !field || field.trim() === '')) {
  return res.status(400).json({ error: 'All fields are required' });
    }


    if (password !== repassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email or phone already exists' });
    }

    const newUser = await User.create({ name, phone, email, password });
    res.status(201).json({ message: 'Signup successful. Please login.' });
  } catch (error) {
    res.status(500).json({ error: 'Server error during signup' });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body; // removed rememberMe

    const user = await User.findOne({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
    });

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Use default token creation without rememberMe
    const token = createToken(user._id); // removed rememberMe
    res.status(200).json({ token, userId: user._id });
  } catch (error) {
    res.status(500).json({ error: 'Server error during login' });
  }
};

