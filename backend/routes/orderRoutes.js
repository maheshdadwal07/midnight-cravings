import express from "express";
import Order from "../models/Order.js";
import SellerProduct from "../models/SellerProduct.js";
import { protectRoute } from "../middleware/authMiddleware.js";

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
      .populate({ path: 'sellerProduct_id', populate: { path: 'product_id', select: 'name category image' } })
      .populate('user_id', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Seller: Update order status
router.patch("/:id", protectRoute(["seller"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findById(id).populate("sellerProduct_id");
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Only seller who owns this listing can update
    if (order.sellerProduct_id.seller_id.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this order" });
    }

    order.status = status;
    await order.save();

    res.json({ message: "Order status updated", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
