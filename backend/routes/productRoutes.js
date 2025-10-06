import express from "express";
import Product from "../models/Product.js";
import SellerProduct from "../models/SellerProduct.js";
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

// ---------------- GET all products ----------------
router.get("/", async (req, res) => {
  try {
    const { hostel, category, name } = req.query;

    const filter = {};
    if (hostel) filter.hostel = hostel;
    if (category) filter.category = category;
    if (name) filter.name = { $regex: name, $options: "i" }; // case-insensitive

    // Join with SellerProduct to include price information
    const pipeline = [
      { $match: filter },
      {
        $lookup: {
          from: "sellerproducts",
          localField: "_id",
          foreignField: "product_id",
          as: "sellers",
        },
      },
      {
        $addFields: {
          price: {
            $cond: [
              { $gt: [{ $size: "$sellers" }, 0] },
              { $min: "$sellers.price" },
              null,
            ],
          },
          sellerCount: { $size: "$sellers" },
        },
      },
      { $sort: { createdAt: -1 } },
    ];

    const products = await Product.aggregate(pipeline);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ---------------- POST add product (admin only) ----------------
router.post(
  "/",
  protectRoute(["admin"]),
  upload.single("image"),
  async (req, res) => {
    try {
      const { name, category, hostel, description } = req.body;
      const image = req.file ? `/uploads/${req.file.filename}` : null;

      if (!name || !category || !hostel) {
        return res
          .status(400)
          .json({ message: "Name, category, and hostel are required" });
      }

      const existing = await Product.findOne({ name, hostel });
      if (existing) {
        return res
          .status(400)
          .json({ message: "Product already exists in this hostel" });
      }

      const product = await Product.create({
        name,
        category,
        hostel,
        description,
        image,
      });
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// ---------------- PATCH update product (admin only) ----------------
router.patch(
  "/:id",
  protectRoute(["admin"]),
  upload.single("image"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, category, hostel, description } = req.body;

      const product = await Product.findById(id);
      if (!product)
        return res.status(404).json({ message: "Product not found" });

      if (name !== undefined) product.name = name;
      if (category !== undefined) product.category = category;
      if (hostel !== undefined) product.hostel = hostel;
      if (description !== undefined) product.description = description;

      if (req.file) {
        product.image = `/uploads/${req.file.filename}`;
      }

      await product.save();
      res.json({ message: "Product updated", product });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// ---------------- DELETE product (admin only) ----------------
router.delete("/:id", protectRoute(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    await product.deleteOne();
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
