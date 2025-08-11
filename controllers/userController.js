import User from '../models/User.js';

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find user but exclude password field
    const user = await User.findById(id).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error.message);
    res.status(500).json({ error: 'Server error while fetching user' });
  }
};



// Update profile picture
export const updateProfilePic = async (req, res) => {
  try {
    const userId = req.user.id; // From verifyToken middleware
    const { profilePic } = req.body;

    if (!profilePic) {
      return res.status(400).json({ error: "Profile picture string is required" });
    }

    await User.findByIdAndUpdate(userId, { profilePic });

    res.status(200).json({ message: "Profile picture updated successfully" });
  } catch (error) {
    console.error("Error updating profile picture:", error);
    res.status(500).json({ error: "Server error while updating profile picture" });
  }
};

// Get profile picture
export const getProfilePic = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("profilePic");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ profilePic: user.profilePic });
  } catch (error) {
    console.error("Error fetching profile picture:", error);
    res.status(500).json({ error: "Server error while fetching profile picture" });
  }
};

