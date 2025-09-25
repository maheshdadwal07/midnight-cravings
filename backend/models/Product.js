// backend/models/Product.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    hostel: { type: String, required: true },
    image: { type: String },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
