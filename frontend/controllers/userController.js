const User = require("../../../backend/models/User"); // Updated path

// @desc    Get the logged-in user's profile
// @route   GET /api/user/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // Exclude password
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching profile:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update the logged-in user's profile
// @route   PUT /api/user/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { username, email, avatar } = req.body;

    // Find the user by ID
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields
    if (username) user.username = username;
    if (email) user.email = email;
    if (avatar) user.avatar = avatar;

    // Save the updated user
    const updatedUser = await user.save();

    res.status(200).json({
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
    });
  } catch (error) {
    console.error("Error updating profile:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
// @desc    Change the logged-in user's password
// @route   PUT /api/user/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
console.log(currentPassword);
    // Find the user by ID
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if current password matches
    console.log(currentPassword)
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Update to new password
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error changing password:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Upload the user's profile picture
// @route   POST /api/user/upload-profile-picture
// @access  Private
const uploadProfilePicture = async (req, res) => {
  try {
    console.log(req.file); // Check if the file is being uploaded

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Assuming the file path is stored in req.file.path
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.avatar = req.file.path;
    await user.save();

    res.status(200).json({ message: "Profile picture uploaded successfully", avatar: user.avatar });
  } catch (error) {
    console.error("Error uploading profile picture:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  uploadProfilePicture,
};

