import mongoose from "mongoose";

const productRequestSchema = new mongoose.Schema(
  {
    seller_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productName: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ["Snacks", "Beverages", "Instant Food", "Desserts", "Other"],
    },
    description: { type: String, required: true },
    image: { type: String, required: true },
    suggestedPrice: { type: Number, required: true },
    stock: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminNote: { type: String }, // Admin can add note when approving/rejecting
    // Reference to created product if approved
    createdProduct_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    createdSellerProduct_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SellerProduct",
    },
  },
  { timestamps: true }
);

const ProductRequest = mongoose.model("ProductRequest", productRequestSchema);
export default ProductRequest;
