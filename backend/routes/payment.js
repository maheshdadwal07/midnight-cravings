import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import { protectRoute } from "../middleware/authMiddleware.js";
import Order from "../models/Order.js";
import Notification from "../models/Notification.js";
import SellerProduct from "../models/SellerProduct.js";
import User from "../models/User.js";
import { sendOrderNotificationEmail } from "../utils/emailService.js";

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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, items, customDelivery } = req.body;

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

    // Get buyer info for delivery address
    const buyer = await User.findById(req.user._id);
    if (!buyer) {
      return res.status(404).json({ message: "User not found" });
    }

    // Use custom delivery address if provided, otherwise use buyer's address
    const deliveryHostel = customDelivery?.hostel || buyer.hostelBlock || "Not provided";
    const deliveryRoom = customDelivery?.room || buyer.roomNumber || "Not provided";

    // Generate unique 6-digit verification code for this order group
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Create orders for each cart item, attach razorpay info and verification code
    const created = [];
    const sellerNotifications = new Map(); // Group by seller to avoid multiple notifications

    for (const it of items) {
      const orderDoc = await Order.create({
        user_id: req.user._id,
        sellerProduct_id: it.sellerProduct_id,
        quantity: it.quantity,
        totalPrice: it.price * it.quantity,
        deliveryHostel,
        deliveryRoom,
        buyerName: buyer.name || "Guest",
        paymentStatus: "paid",
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        status: "pending",
        verificationCode, // Add verification code
        isVerified: false,
      });
      created.push(orderDoc);

      // Get seller info to send notification
      try {
        const sellerProduct = await SellerProduct.findById(it.sellerProduct_id).populate('product_id');
        if (sellerProduct && sellerProduct.seller_id) {
          const sellerId = sellerProduct.seller_id.toString();
          
          // Group orders by seller
          if (!sellerNotifications.has(sellerId)) {
            sellerNotifications.set(sellerId, {
              sellerId,
              orders: [],
              totalAmount: 0
            });
          }
          
          const sellerData = sellerNotifications.get(sellerId);
          sellerData.orders.push({
            productName: sellerProduct.product_id?.name || 'Product',
            quantity: it.quantity,
            price: it.price * it.quantity
          });
          sellerData.totalAmount += it.price * it.quantity;
        }
      } catch (notifError) {
        console.error('Error creating seller notification:', notifError);
      }
    }

    // Create notifications and send emails for each seller
    for (const [sellerId, data] of sellerNotifications) {
      try {
        const orderDetails = data.orders.map(o => 
          `${o.productName} (Qty: ${o.quantity}) - ₹${o.price}`
        ).join(', ');
        
        // Create in-app notification
        await Notification.create({
          user_id: sellerId,
          message: `🎉 New Order Received! Total: ₹${data.totalAmount}. Items: ${orderDetails}`,
          type: "order",
          order_id: created[0]._id, // Reference first order for this group
        });

        // Send email notification
        try {
          const seller = await User.findById(sellerId);
          if (seller && seller.email) {
            await sendOrderNotificationEmail(
              seller.email,
              seller.name || seller.shopName || 'Seller',
              {
                totalAmount: data.totalAmount,
                orders: data.orders,
                deliveryHostel,
                deliveryRoom,
                buyerName: buyer.name || "Guest"
              }
            );
            console.log(`Email sent to seller: ${seller.email}`);
          }
        } catch (emailError) {
          console.error('Error sending email to seller:', emailError);
          // Don't fail the order if email fails
        }
      } catch (notifError) {
        console.error('Error saving notification:', notifError);
      }
    }

    res.json({ ok: true, orders: created });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

export default router;
