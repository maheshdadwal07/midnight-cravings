import express from "express";
import Review from "../models/Review.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// @route   POST /api/reviews
// @desc    Create a review for a seller (only for delivered orders)
// @access  Private (user)
router.post("/", protect, async (req, res) => {
  try {
    const { order_id, seller_id, rating, comment } = req.body;

    // Validate required fields
    if (!order_id || !seller_id || !rating || !comment) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if order exists and belongs to the user
    const order = await Order.findById(order_id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to review this order" });
    }

    // Check if order is delivered/completed
    if (order.status !== "delivered" && order.status !== "completed") {
      return res.status(400).json({ message: "Can only review delivered/completed orders" });
    }

    // Check if review already exists for this order
    const existingReview = await Review.findOne({ user_id: req.user._id, order_id });
    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this order" });
    }

    // Validate seller exists
    const seller = await User.findById(seller_id);
    if (!seller || seller.role !== "seller") {
      return res.status(404).json({ message: "Seller not found" });
    }

    // Create review
    const review = await Review.create({
      seller_id,
      user_id: req.user._id,
      order_id,
      rating: Number(rating),
      comment: comment.trim(),
    });

    const populatedReview = await Review.findById(review._id)
      .populate("user_id", "name")
      .populate("seller_id", "name shopName");

    res.status(201).json(populatedReview);
  } catch (error) {
    console.error("Create review error:", error);
    res.status(500).json({ message: "Failed to create review" });
  }
});

// @route   GET /api/reviews/seller/:sellerId
// @desc    Get all active reviews for a seller
// @access  Public
router.get("/seller/:sellerId", async (req, res) => {
  try {
    const reviews = await Review.find({
      seller_id: req.params.sellerId,
      status: "active",
    })
      .populate("user_id", "name")
      .populate("seller_id", "name email shopName hostelBlock roomNumber")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error("Get seller reviews error:", error);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
});

// @route   GET /api/reviews/seller/:sellerId/stats
// @desc    Get seller rating statistics
// @access  Public
router.get("/seller/:sellerId/stats", async (req, res) => {
  try {
    const reviews = await Review.find({
      seller_id: req.params.sellerId,
      status: "active",
    });

    if (reviews.length === 0) {
      return res.json({
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      });
    }

    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = (totalRating / reviews.length).toFixed(1);

    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      ratingDistribution[r.rating]++;
    });

    res.json({
      averageRating: Number(averageRating),
      totalReviews: reviews.length,
      ratingDistribution,
    });
  } catch (error) {
    console.error("Get seller stats error:", error);
    res.status(500).json({ message: "Failed to fetch seller stats" });
  }
});

// @route   GET /api/reviews/my-reviews
// @desc    Get current user's reviews
// @access  Private
router.get("/my-reviews", protect, async (req, res) => {
  try {
    const reviews = await Review.find({ user_id: req.user._id })
      .populate("seller_id", "name shopName")
      .populate("order_id")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error("Get my reviews error:", error);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
});

// @route   GET /api/reviews/can-review/:orderId
// @desc    Check if user can review an order
// @access  Private
router.get("/can-review/:orderId", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate(
      "sellerProduct_id",
      "seller_id"
    );

    if (!order) {
      return res.json({ canReview: false, reason: "Order not found" });
    }

    if (order.user_id.toString() !== req.user._id.toString()) {
      return res.json({ canReview: false, reason: "Not your order" });
    }

    if (order.status !== "delivered" && order.status !== "completed") {
      return res.json({ canReview: false, reason: "Order not completed yet" });
    }

    const existingReview = await Review.findOne({
      user_id: req.user._id,
      order_id: req.params.orderId,
    });

    if (existingReview) {
      return res.json({ canReview: false, reason: "Already reviewed" });
    }

    res.json({
      canReview: true,
      seller_id: order.sellerProduct_id?.seller_id,
    });
  } catch (error) {
    console.error("Can review check error:", error);
    res.status(500).json({ message: "Failed to check review eligibility" });
  }
});

// ===== ADMIN ROUTES =====

// @route   GET /api/reviews/admin/all
// @desc    Get all reviews (admin)
// @access  Private/Admin
router.get("/admin/all", protect, adminOnly, async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user_id", "name email")
      .populate("seller_id", "name email shopName hostelBlock")
      .populate("order_id", "status totalPrice")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error("Get all reviews error:", error);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
});

// @route   PUT /api/reviews/admin/:reviewId/flag
// @desc    Flag a review (admin)
// @access  Private/Admin
router.put("/admin/:reviewId/flag", protect, adminOnly, async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.reviewId,
      { status: "flagged" },
      { new: true }
    )
      .populate("user_id", "name email")
      .populate("seller_id", "name shopName");

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.json(review);
  } catch (error) {
    console.error("Flag review error:", error);
    res.status(500).json({ message: "Failed to flag review" });
  }
});

// @route   PUT /api/reviews/admin/:reviewId/remove
// @desc    Remove a review (admin)
// @access  Private/Admin
router.put("/admin/:reviewId/remove", protect, adminOnly, async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.reviewId,
      { status: "removed" },
      { new: true }
    )
      .populate("user_id", "name email")
      .populate("seller_id", "name shopName");

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.json(review);
  } catch (error) {
    console.error("Remove review error:", error);
    res.status(500).json({ message: "Failed to remove review" });
  }
});

// @route   PUT /api/reviews/admin/:reviewId/activate
// @desc    Activate a flagged/removed review (admin)
// @access  Private/Admin
router.put("/admin/:reviewId/activate", protect, adminOnly, async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.reviewId,
      { status: "active" },
      { new: true }
    )
      .populate("user_id", "name email")
      .populate("seller_id", "name shopName");

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.json(review);
  } catch (error) {
    console.error("Activate review error:", error);
    res.status(500).json({ message: "Failed to activate review" });
  }
});

export default router;
