import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import dotenv from "dotenv";
dotenv.config();

export const createAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const exists = await Admin.findOne({ username });
    if (exists) return res.status(400).json({ error: "Admin already exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    const admin = await Admin.create({ username, passwordHash });
    res.json({ message: "Admin created", adminId: admin._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(404).json({ error: `User ${username} not found` });

    const match = await bcrypt.compare(password, admin.passwordHash);
    if (!match) return res.status(401).json({ error: "Wrong password" });

    // generate JWT (payload can be minimal)
    const token = jwt.sign(
      { adminId: admin._id, username: admin.username, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    // Send token as HTTP-only cookie
  res
  .cookie("token", token, {
    httpOnly: true,           // prevent JS access
    secure: process.env.NODE_ENV === "production", // only HTTPS in prod
    sameSite: "None",       // block CSRF from other sites
    maxAge: 12 * 60 * 60 * 1000 // 12 hours
  })
  .json({ message: "Login successful" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
