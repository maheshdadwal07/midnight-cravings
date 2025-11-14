import express from "express";
import Order from "../models/Order.js";
import SellerProduct from "../models/SellerProduct.js";
import User from "../models/User.js";
import { protectRoute } from "../middleware/authMiddleware.js";
import { sendOrderStatusEmail } from "../utils/emailService.js";

const router = express.Router();

// ✅ User: Place a new order
router.post("/", protectRoute(["user"]), async (req, res) => {
  try {
    const { sellerProduct_id, quantity } = req.body;

    const sellerProduct = await SellerProduct.findById(sellerProduct_id);
    if (!sellerProduct)
      return res.status(404).json({ message: "Listing not found" });

    if (quantity > sellerProduct.stock) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    const totalPrice = quantity * sellerProduct.price;

    const order = await Order.create({
      user_id: req.user.id,
      sellerProduct_id,
      quantity,
      totalPrice,
    });

    // Reduce stock
    sellerProduct.stock -= quantity;
    await sellerProduct.save();

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ User: Get their own orders
router.get("/my-orders", protectRoute(["user"]), async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.user.id })
      .populate({
        path: "sellerProduct_id",
        populate: { path: "product_id", select: "name category image" },
      })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Seller: Get orders for their listings
router.get("/seller-orders", protectRoute(["seller"]), async (req, res) => {
  try {
    const orders = await Order.find()
      .populate({
        path: "sellerProduct_id",
        match: { seller_id: req.user.id }, // only seller's own listings
        populate: { path: "product_id", select: "name category image" },
      })
      .populate("user_id", "name email")
      .sort({ createdAt: -1 });

    // Filter out null (other sellers' orders)
    res.json(orders.filter((o) => o.sellerProduct_id));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: get all orders
router.get('/', protectRoute(['admin']), async (req, res) => {
  try {
    const orders = await Order.find()
      .populate({ 
        path: 'sellerProduct_id', 
        populate: [
          { path: 'product_id', select: 'name category image' },
          { path: 'seller_id', select: 'name email shopName hostelBlock roomNumber' }
        ]
      })
      .populate('user_id', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Seller: Verify OTP and complete order
router.post("/:id/verify-completion", protectRoute(["seller"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { verificationCode } = req.body;

    const order = await Order.findById(id).populate("sellerProduct_id user_id");
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Check if sellerProduct_id exists and has seller_id
    if (!order.sellerProduct_id || !order.sellerProduct_id.seller_id) {
      return res.status(400).json({ message: "Invalid order data" });
    }

    // Only seller who owns this listing can verify
    if (order.sellerProduct_id.seller_id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Check if order has verification code
    if (!order.verificationCode) {
      return res.status(400).json({ message: "This order doesn't require verification" });
    }

    // Verify the code
    if (order.verificationCode !== verificationCode) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // Mark as verified and completed
    order.isVerified = true;
    order.status = "completed";
    await order.save();

    // Send email notification to buyer about completion
    setImmediate(async () => {
      try {
        if (order.user_id && order.user_id.email) {
          const { sendOrderStatusEmail } = await import("../utils/emailService.js");
          await sendOrderStatusEmail(
            order.user_id.email,
            order.user_id.name || 'Customer',
            'completed',
            { orderId: order._id }
          );
          console.log(`Completion email sent to buyer: ${order.user_id.email}`);
        }
      } catch (emailError) {
        console.error('Error sending completion email:', emailError.message);
      }
    });

    res.json({ message: "Order completed successfully", order });
  } catch (error) {
    console.error('Order verification error:', error);
    res.status(500).json({ message: error.message || "Failed to verify order" });
  }
});

// ✅ Seller: Update order status
router.patch("/:id", protectRoute(["seller"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findById(id).populate("sellerProduct_id user_id");
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Check if sellerProduct_id exists and has seller_id
    if (!order.sellerProduct_id || !order.sellerProduct_id.seller_id) {
      return res.status(400).json({ message: "Invalid order data" });
    }

    // Only seller who owns this listing can update
    if (order.sellerProduct_id.seller_id.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this order" });
    }

    // Prevent completing order without verification if it has a verification code
    if (status === "completed" && order.verificationCode && !order.isVerified) {
      return res.status(400).json({ 
        message: "Order requires verification code before completion",
        requiresVerification: true 
      });
    }

    order.status = status;
    await order.save();

    // Send email notification to buyer about status change (non-blocking)
    setImmediate(async () => {
      try {
        if (order.user_id && order.user_id.email) {
          await sendOrderStatusEmail(
            order.user_id.email,
            order.user_id.name || 'Customer',
            status,
            { orderId: order._id }
          );
          console.log(`Status update email sent to buyer: ${order.user_id.email}`);
        }
      } catch (emailError) {
        console.error('Error sending status email:', emailError.message);
        // Email failure doesn't affect the order update
      }
    });

    res.json({ message: "Order status updated", order });
  } catch (error) {
    console.error('Order update error:', error);
    res.status(500).json({ message: error.message || "Failed to update order" });
  }
});

export default router;
