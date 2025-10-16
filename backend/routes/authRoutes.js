// import express from "express";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import User from "../models/User.js";

// const router = express.Router();

// // POST signup
// router.post("/signup", async (req, res) => {
//   try {
//     let { name, email, password, role } = req.body;

//     if (!name || !email || !password) {
//       return res
//         .status(400)
//         .json({ message: "Name, email, and password are required" });
//     }

//     // Normalize email
//     email = email.toLowerCase();

//     // Prevent users from setting themselves as admin
//     const userRole = role && role === "seller" ? "seller" : "user";

//     // Check if email already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: "Email already registered" });
//     }

//     // Hash password
//     const passwordHash = await bcrypt.hash(password, 10);

//     // Create user
//     const newUser = await User.create({
//       name,
//       email,
//       passwordHash,
//       role: userRole,
//     });

//     // Create JWT token
//     const token = jwt.sign(
//       { id: newUser._id, role: newUser.role },
//       process.env.JWT_SECRET,
//       {
//         expiresIn: "1d",
//       }
//     );

//     res.status(201).json({
//       message: "Signup successful",
//       userId: newUser._id,
//       name: newUser.name,
//       role: newUser.role,
//       token,
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Signup failed", error: error.message });
//   }
// });

// // POST login


// router.post("/login", async (req, res) => {
//   try {
//     let { email, password } = req.body;

//     if (!email || !password) {
//       return res
//         .status(400)
//         .json({ message: "Email and password are required" });
//     }

//     email = email.toLowerCase();

//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: "Invalid credentials" });
//     if (user.banned)
//       return res.status(403).json({ message: "User is banned" });
//     const validPassword = await bcrypt.compare(password, user.passwordHash);
//     if (!validPassword)
//       return res.status(400).json({ message: "Invalid credentials" });

//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       {
//         expiresIn: "1d",
//       }
//     );

//     res.json({
//       message: "Login successful",
//       token,
//       name: user.name,
//       role: user.role,
//       userId: user._id,
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Login failed", error: error.message });
//   }
// });

// export default router;








import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protectRoute } from "../middleware/authMiddleware.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// ---------------- Multer setup ----------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// ---------------- POST signup ----------------
router.post("/signup", upload.single("collegeId"), async (req, res) => {
  try {
    let {
      name,
      email,
      password,
      role,
      hostelBlock,
      roomNumber,
      upiId,
      shopName,
    } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    email = email.toLowerCase();

    // Prevent users from setting themselves as admin
    const userRole = role && role === "seller" ? "seller" : "user";

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Base user object
    const userData = {
      name,
      email,
      passwordHash,
      role: userRole,
    };

    // Seller-specific fields
    if (userRole === "seller") {
      if (!hostelBlock || !roomNumber || !upiId || !req.file) {
        return res.status(400).json({
          message:
            "Hostel block, room number, UPI ID, and college ID image are required for seller signup",
        });
      }

      userData.hostelBlock = hostelBlock;
      userData.roomNumber = roomNumber;
      userData.upiId = upiId;
      userData.collegeIdUrl = `/uploads/${req.file.filename}`; // save path
      userData.shopName = shopName || "";
      userData.sellerStatus = "pending_verification"; // admin approval needed
    }

    // Create user
    const newUser = await User.create(userData);

    // Create JWT token
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      message: "Signup successful",
      userId: newUser._id,
      name: newUser.name,
      role: newUser.role,
      token,
      sellerStatus: newUser.sellerStatus || null,
    });
  } catch (error) {
    res.status(500).json({ message: "Signup failed", error: error.message });
  }
});

// ---------------- POST login ----------------
// ---------------- POST login ----------------
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    email = email.toLowerCase();

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    if (user.banned)
      return res.status(403).json({ message: "User is banned" });

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Include sellerStatus in response so frontend knows
    res.json({
      message: "Login successful",
      token,
      name: user.name,
      role: user.role,
      userId: user._id,
      sellerStatus: user.sellerStatus || null,
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});



export default router;
