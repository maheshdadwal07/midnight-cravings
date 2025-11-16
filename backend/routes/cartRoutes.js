import express from "express";
import Cart from "../models/Cart.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get user cart
router.get("/", protectRoute(["user", "seller", "admin"]), async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id }).populate({
      path: 'items.sellerProduct_id',
      populate: {
        path: 'seller_id',
        select: 'name shopName hostelBlock roomNumber'
      }
    });
    res.json(cart || { items: [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add or update item
router.post(
  "/add",
  protectRoute(["user", "seller", "admin"]),
  async (req, res) => {
    try {
      const { product_id, sellerProduct_id, name, price, image, quantity } =
        req.body;
      let cart = await Cart.findOne({ userId: req.user.id });

      if (!cart) {
        cart = new Cart({ userId: req.user.id, items: [] });
      }

      const index = cart.items.findIndex(
        (i) => i.sellerProduct_id?.toString() === sellerProduct_id
      );

      if (index > -1) {
        cart.items[index].quantity += quantity;
      } else {
        cart.items.push({
          product_id,
          sellerProduct_id,
          name,
          price,
          image,
          quantity,
        });
      }

      cart.totalPrice = cart.items.reduce(
        (s, i) => s + i.price * i.quantity,
        0
      );
      await cart.save();
      await cart.populate({
        path: 'items.sellerProduct_id',
        populate: {
          path: 'seller_id',
          select: 'name shopName hostelBlock roomNumber'
        }
      });
      res.json(cart);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Update item quantity
router.put(
  "/update",
  protectRoute(["user", "seller", "admin"]),
  async (req, res) => {
    try {
      const { sellerProduct_id, quantity } = req.body;
      const cart = await Cart.findOne({ userId: req.user.id });
      if (!cart) return res.status(404).json({ message: "Cart not found" });

      const item = cart.items.find(
        (i) => i.sellerProduct_id?.toString() === sellerProduct_id
      );
      if (!item) return res.status(404).json({ message: "Item not found" });

      item.quantity = quantity;
      cart.totalPrice = cart.items.reduce(
        (s, i) => s + i.price * i.quantity,
        0
      );
      await cart.save();
      await cart.populate({
        path: 'items.sellerProduct_id',
        populate: {
          path: 'seller_id',
          select: 'name shopName hostelBlock roomNumber'
        }
      });
      res.json(cart);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Remove item
router.delete(
  "/remove/:sellerProduct_id",
  protectRoute(["user", "seller", "admin"]),
  async (req, res) => {
    try {
      const { sellerProduct_id } = req.params;
      const cart = await Cart.findOne({ userId: req.user.id });
      if (!cart) return res.status(404).json({ message: "Cart not found" });

      cart.items = cart.items.filter(
        (i) => i.sellerProduct_id?.toString() !== sellerProduct_id
      );
      cart.totalPrice = cart.items.reduce(
        (s, i) => s + i.price * i.quantity,
        0
      );
      await cart.save();
      await cart.populate({
        path: 'items.sellerProduct_id',
        populate: {
          path: 'seller_id',
          select: 'name shopName hostel'
        }
      });
      res.json(cart);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Clear cart
router.delete(
  "/clear",
  protectRoute(["user", "seller", "admin"]),
  async (req, res) => {
    try {
      await Cart.findOneAndDelete({ userId: req.user.id });
      res.json({ message: "Cart cleared" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

export default router;
