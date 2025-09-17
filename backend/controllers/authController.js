import asyncHandler from "express-async-handler";
import User from "../model/userModel.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/generateToken.js";
import cloudinary from "../lib/cloudinary.js";

//!  Register controller
export const registerController = asyncHandler(async (req, res) => {
  const { email, fullName, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json("Password must me at least 6 characters long");
    }

    const user = await User.findOne({ email });
    if (user) return res.status(409).json("Email already exists");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      fullName,
      password: hashedPassword,
    });

    if (newUser) {
      generateToken(res, newUser._id);
      await newUser.save();
      res.status(200).json({
        _id: newUser._id,
        email: newUser.email,
        fullName: newUser.fullName,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(404).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in register controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

//! Login controller
export const loginController = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(404).json({ message: "Incorrect password" });
    }
    generateToken(res, user._id);
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

//! logout controller
export const logoutController = asyncHandler(async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//! checking auth user
export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
    console.log(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//! update Profile
export const updateProfile = asyncHandler(async (req, res) => {
  const { profilePic } = req.body;
  const userId = req.user._id;
  try {
    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic, {
      folder: "chatty/profile_pics",
    });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    ).select("-password"); // 👈 exclude sensitive fields

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
