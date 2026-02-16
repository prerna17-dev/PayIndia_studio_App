const userModel = require("../models/user.model");

exports.getProfile = async (req, res) => {
  const userId = req.user.userId;

  const [[user]] = await userModel.getUserById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user);
};

exports.updateProfile = async (req, res) => {
  const userId = req.user.userId;
  const { name, gender, date_of_birth, profile_image } = req.body;

  await userModel.updateProfile(userId, {
    name,
    gender,
    date_of_birth,
    profile_image,
  });

  res.json({ message: "Profile updated successfully" });
};
