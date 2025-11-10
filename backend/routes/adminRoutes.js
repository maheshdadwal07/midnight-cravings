import express from "express";
import User from "../models/User.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Admin: Get all users
router.get("/users", protectRoute(["admin"]), async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).select("-passwordHash");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// ✅ Admin: Get all sellers
router.get("/sellers", protectRoute(["admin"]), async (req, res) => {
  try {
    const sellers = await User.find({ role: "seller" }).select("-passwordHash");
    res.json(sellers);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch sellers" });
  }
});

// ✅ Admin: Get full seller profile (for See Profile)
router.get("/seller/:id", protectRoute(["admin"]), async (req, res) => {
  try {
    const seller = await User.findById(req.params.id)
      .select("-passwordHash")
      .populate({
        path: "products",
        select: "name category image price stock",
      });

    if (!seller || seller.role !== "seller") {
      return res.status(404).json({ message: "Seller not found" });
    }

    res.json(seller);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch seller details", error: err.message });
  }
});

// ✅ Admin: Delete user or seller
router.delete("/user/:id", protectRoute(["admin"]), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});

// ✅ Admin: Ban / unban seller
router.patch("/seller/:id/ban", protectRoute(["admin"]), async (req, res) => {
  try {
    const seller = await User.findById(req.params.id);
    if (!seller || seller.role !== "seller") {
      return res.status(404).json({ message: "Seller not found" });
    }

    seller.banned = !seller.banned;
    await seller.save();

    res.json({
      message: seller.banned ? "Seller banned" : "Seller unbanned",
      banned: seller.banned,
    });
  } catch (err) {
    res.status(500).json({ message: "Ban toggle failed", error: err.message });
  }
});

// ✅ Admin: Approve / reject seller verification
router.patch("/seller/:id/verify", protectRoute(["admin"]), async (req, res) => {
  try {
    const { status } = req.body; // "approved" or "rejected"
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const seller = await User.findById(req.params.id);
    if (!seller || seller.role !== "seller") {
      return res.status(404).json({ message: "Seller not found" });
    }

    seller.sellerStatus = status;
    await seller.save();

    res.json({
      message: `Seller has been ${status}`,
      sellerId: seller._id,
      sellerStatus: seller.sellerStatus,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Verification failed", error: error.message });
  }
});

export default router;
