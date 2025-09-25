// backend/routes/productRoutes.js
import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

// GET all products
router.get("/", async (req, res) => {
  try {
    const { hostel } = req.query; // filter by hostel
    const products = hostel
      ? await Product.find({ hostel })
      : await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST add product
router.post("/", async (req, res) => {
  try {
    const { name, category, price, hostel, image } = req.body;
    const product = new Product({ name, category, price, hostel, image });
    const saved = await product.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
