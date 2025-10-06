import express from "express";
import SellerProduct from "../models/SellerProduct.js";
import Product from "../models/Product.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Seller: Add inventory for a product
router.post("/:productId", protectRoute(["seller"]), async (req, res) => {
  try {
    const { productId } = req.params;
    const { price, stock, hostel } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Prevent duplicate listing by same seller for same product
    const existingListing = await SellerProduct.findOne({
      product_id: productId,
      seller_id: req.user.id,
    });

    if (existingListing) {
      return res
        .status(400)
        .json({
          message:
            "You already have a listing for this product. Use update instead.",
        });
    }

    const sellerProduct = await SellerProduct.create({
      product_id: productId,
      seller_id: req.user.id,
      price,
      stock,
      hostel,
    });

    res.status(201).json(sellerProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Seller: Update their own listing
router.patch("/:id", protectRoute(["seller"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { price, stock, hostel } = req.body;

    const listing = await SellerProduct.findById(id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    // Only the seller who owns this listing can update it
    if (listing.seller_id.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You cannot update another seller's listing" });
    }

    if (price !== undefined) listing.price = price;
    if (stock !== undefined) listing.stock = stock;
    if (hostel !== undefined) listing.hostel = hostel;

    await listing.save();
    res.json({ message: "Listing updated", listing });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Seller: Delete their listing
router.delete("/:id", protectRoute(["seller"]), async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await SellerProduct.findById(id);
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

// ✅ Get all sellers for a product
router.get("/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const sellers = await SellerProduct.find({
      product_id: productId,
    }).populate("seller_id", "name");
    res.json(sellers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get listings for current seller
router.get('/', protectRoute(['seller']), async (req, res) => {
  try {
    const listings = await SellerProduct.find({ seller_id: req.user.id }).populate('product_id', 'name category image');
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
