import express from "express";
import SellerProduct from "../models/SellerProduct.js";
import Product from "../models/Product.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Seller: Add inventory for an existing product
router.post("/:productId", protectRoute(["seller"]), async (req, res) => {
  try {
    const { productId } = req.params;
    const { price, stock } = req.body; // no hostel from request

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Prevent duplicate listing by same seller
    const existingListing = await SellerProduct.findOne({
      product_id: productId,
      seller_id: req.user.id,
    });

    if (existingListing) {
      return res.status(400).json({
        message:
          "You already have a listing for this product. Use update instead.",
      });
    }

    // Auto-set hostel from seller's hostelBlock
    const sellerHostel = req.user.hostelBlock;
    if (!sellerHostel) {
      return res
        .status(400)
        .json({ message: "Seller hostel information is missing." });
    }

    const sellerProduct = await SellerProduct.create({
      product_id: productId,
      seller_id: req.user.id,
      price,
      stock,
      hostel: sellerHostel,
    });

    res.status(201).json(sellerProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Seller: Update their own listing (price & stock only)
router.patch("/:id", protectRoute(["seller"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { price, stock } = req.body;

    const listing = await SellerProduct.findById(id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    if (listing.seller_id.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You cannot update another seller's listing" });
    }

    if (price !== undefined) listing.price = price;
    if (stock !== undefined) listing.stock = stock;

    await listing.save();
    res.json({ message: "Listing updated", listing });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Seller: Delete their listing
router.delete("/:id", protectRoute(["seller"]), async (req, res) => {
  try {
    const listing = await SellerProduct.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    if (listing.seller_id.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You cannot delete another seller's listing" });
    }

    await listing.deleteOne();
    res.json({ message: "Listing deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Get all active sellers for a product
router.get("/:productId", async (req, res) => {
  try {
    const sellers = await SellerProduct.find({
      product_id: req.params.productId,
    }).populate({
      path: "seller_id",
      select: "name shopName banned hostelBlock",
      match: { banned: false }, // exclude banned sellers
    });

    const activeSellers = sellers.filter((s) => s.seller_id); // remove null
    res.json(activeSellers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Seller: Get their own listings
router.get("/", protectRoute(["seller"]), async (req, res) => {
  try {
    const listings = await SellerProduct.find({
      seller_id: req.user.id,
    }).populate("product_id", "name category image");
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
