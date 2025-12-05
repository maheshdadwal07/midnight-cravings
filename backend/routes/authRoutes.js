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

    // Hostel and room are required for all users (buyers and sellers)
    if (!hostelBlock || !roomNumber) {
      return res
        .status(400)
        .json({ message: "Hostel and room number are required" });
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

    // Base user object (hostel and room for everyone)
    const userData = {
      name,
      email,
      passwordHash,
      role: userRole,
      hostelBlock,
      roomNumber,
    };

    // Seller-specific fields
    if (userRole === "seller") {
      if (!upiId || !req.file) {
        return res.status(400).json({
          message:
            "UPI ID and college ID image are required for seller signup",
        });
      }

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
      email: newUser.email,
      role: newUser.role,
      token,
      sellerStatus: newUser.sellerStatus || null,
      hostelBlock: newUser.hostelBlock || null,
      roomNumber: newUser.roomNumber || null,
      shopName: newUser.shopName || null,
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

    // Include sellerStatus and hostel info in response
    res.json({
      message: "Login successful",
      token,
      name: user.name,
      email: user.email,
      role: user.role,
      userId: user._id,
      sellerStatus: user.sellerStatus || null,
      hostelBlock: user.hostelBlock || null,
      roomNumber: user.roomNumber || null,
      shopName: user.shopName || null,
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});

// ---------------- PUT update profile ----------------
router.put("/profile", protectRoute(), async (req, res) => {
  try {
    const { name, email, hostelBlock, roomNumber, shopName } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    if (hostelBlock) user.hostelBlock = hostelBlock;
    if (roomNumber) user.roomNumber = roomNumber;
    if (shopName && user.role === "seller") user.shopName = shopName;

    await user.save();

    // Return updated user data (exclude sensitive fields)
    const updatedUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      hostelBlock: user.hostelBlock,
      roomNumber: user.roomNumber,
      shopName: user.shopName,
      sellerStatus: user.sellerStatus,
      createdAt: user.createdAt,
    };

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile", error: error.message });
  }
});

// ---------------- GET current user info ----------------
router.get("/me", protectRoute(), async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user", error: error.message });
  }
});

// ---------------- PUT change password ----------------
router.put("/change-password", protectRoute(), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user.id || req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = newPasswordHash;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Failed to change password", error: error.message });
  }
});

export default router;
