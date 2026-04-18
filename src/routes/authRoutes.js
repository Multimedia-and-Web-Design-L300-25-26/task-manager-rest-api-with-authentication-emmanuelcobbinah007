import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  // - Validate input
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // if (name.type !== "string" || email.type !== "string" || password.type !== "string") {
  //   return res.status(400).json({ message: "Invalid input types" });
  // }

  if (email.split("@").length !== 2) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  // - Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "User with this email already exists" });
  }

  // - Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // - Create user
  const newUser = new User({
    name,
    email,
    password: hashedPassword,
  });

  // - Save user
  await newUser.save();

  // - Return user (without password)
  const { password: _, ...userWithoutPassword } = newUser.toObject();
  res.status(201).json(userWithoutPassword);
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  // - Validate input
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  
  // - Find user
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  // - Compare password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  // - Generate JWT
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

  // - Return token
  res.json({ token });
});

export default router;