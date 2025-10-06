import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import { protectRoute } from "../middleware/authMiddleware.js";
import Order from "../models/Order.js";

const router = express.Router();

// Create a Razorpay order (authenticated)
router.post("/create-order", protectRoute(), async (req, res) => {
  try {
    const { amount, localOrderId } = req.body;

    if (!amount) return res.status(400).json({ message: "Amount required" });

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: Math.round(amount * 100), // paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);

    // If a local order id was provided, set its razorpay_order_id so we can reconcile later
    if (localOrderId) {
      try {
        await Order.findByIdAndUpdate(localOrderId, {
          razorpay_order_id: order.id,
          paymentStatus: "pending",
        });
      } catch (e) {
        // ignore - not critical for order creation
        console.warn("Failed to attach razorpay_order_id to local order", e.message);
      }
    }

    res.json(order);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Verify payment signature and mark order paid
router.post("/verify", protectRoute(), async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      localOrderId,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature)
      return res.status(400).json({ message: "Missing payment fields" });

    // Validate signature
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      // Optionally mark local order as failed
      if (localOrderId) {
        await Order.findByIdAndUpdate(localOrderId, {
          paymentStatus: "failed",
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
        });
      }
      return res.status(400).json({ ok: false, message: "Invalid signature" });
    }

    // Signature valid — update local order
    if (localOrderId) {
      await Order.findByIdAndUpdate(localOrderId, {
        paymentStatus: "paid",
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        status: "pending",
      });
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Complete payment for multiple cart items: verify signature and create Order docs
router.post("/complete", protectRoute(), async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, items } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !Array.isArray(items))
      return res.status(400).json({ message: "Missing fields" });

    // Validate signature
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ ok: false, message: "Invalid signature" });
    }

    // Create orders for each cart item, attach razorpay info
    const created = [];
    for (const it of items) {
      const orderDoc = await Order.create({
        user_id: req.user._id,
        sellerProduct_id: it.sellerProduct_id,
        quantity: it.quantity,
        totalPrice: it.price * it.quantity,
        paymentStatus: "paid",
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        status: "pending",
      });
      created.push(orderDoc);
    }

    res.json({ ok: true, orders: created });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

export default router;
