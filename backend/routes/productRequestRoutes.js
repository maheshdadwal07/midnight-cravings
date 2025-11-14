import express from "express";
import multer from "multer";
import path from "path";
import ProductRequest from "../models/ProductRequest.js";
import Product from "../models/Product.js";
import SellerProduct from "../models/SellerProduct.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

// Configure multer for product request image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Seller: Submit a product request
router.post("/", protectRoute(["seller"]), upload.single("image"), async (req, res) => {
  try {
    const { productName, category, description, suggestedPrice, stock } = req.body;

    if (!productName || !category || !description || !suggestedPrice || !stock) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Product image is required" });
    }

    const productRequest = await ProductRequest.create({
      seller_id: req.user._id,
      productName,
      category,
      description,
      image: req.file.filename,
      suggestedPrice: parseFloat(suggestedPrice),
      stock: parseInt(stock),
      status: "pending",
    });

    // Notify all admins
    const admins = await User.find({ role: "admin" });
    for (const admin of admins) {
      await Notification.create({
        user_id: admin._id,
        message: `🆕 New product request: ${productName} from seller`,
        type: "admin",
      });
    }

    res.status(201).json({
      message: "Product request submitted successfully",
      productRequest,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Seller: Get their own product requests
router.get("/my-requests", protectRoute(["seller"]), async (req, res) => {
  try {
    const requests = await ProductRequest.find({ seller_id: req.user._id })
      .populate("createdProduct_id", "name category")
      .populate("createdSellerProduct_id", "price stock")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Get all product requests
router.get("/", protectRoute(["admin"]), async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const requests = await ProductRequest.find(filter)
      .populate("seller_id", "name email shopName")
      .populate("createdProduct_id", "name category")
      .populate("createdSellerProduct_id", "price stock")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Approve product request
router.patch("/:id/approve", protectRoute(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNote } = req.body;

    const productRequest = await ProductRequest.findById(id).populate("seller_id", "name email shopName hostelBlock");
    if (!productRequest) {
      return res.status(404).json({ message: "Product request not found" });
    }

    if (productRequest.status !== "pending") {
      return res.status(400).json({ message: "Request already processed" });
    }

    // Create the Product
    const product = await Product.create({
      name: productRequest.productName,
      category: productRequest.category,
      description: productRequest.description,
      image: productRequest.image.startsWith('/uploads/') ? productRequest.image : `/uploads/${productRequest.image}`,
    });

    // Create SellerProduct listing for the seller
    const sellerProduct = await SellerProduct.create({
      seller_id: productRequest.seller_id._id,
      product_id: product._id,
      price: productRequest.suggestedPrice,
      stock: productRequest.stock,
      hostel: productRequest.seller_id.hostelBlock || "Not specified",
    });

    // Update product request
    productRequest.status = "approved";
    productRequest.adminNote = adminNote || "Approved";
    productRequest.createdProduct_id = product._id;
    productRequest.createdSellerProduct_id = sellerProduct._id;
    await productRequest.save();

    // Notify seller
    await Notification.create({
      user_id: productRequest.seller_id._id,
      message: `✅ Your product request "${productRequest.productName}" has been approved!`,
      type: "info",
    });

    res.json({
      message: "Product request approved and listing created",
      productRequest,
      product,
      sellerProduct,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Reject product request
router.patch("/:id/reject", protectRoute(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNote } = req.body;

    const productRequest = await ProductRequest.findById(id).populate("seller_id");
    if (!productRequest) {
      return res.status(404).json({ message: "Product request not found" });
    }

    if (productRequest.status !== "pending") {
      return res.status(400).json({ message: "Request already processed" });
    }

    productRequest.status = "rejected";
    productRequest.adminNote = adminNote || "Rejected";
    await productRequest.save();

    // Notify seller
    await Notification.create({
      user_id: productRequest.seller_id._id,
      message: `❌ Your product request "${productRequest.productName}" has been rejected. ${adminNote ? `Reason: ${adminNote}` : ""}`,
      type: "info",
    });

    res.json({
      message: "Product request rejected",
      productRequest,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
