import mongoose from "mongoose";

const sellerProductSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    seller_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // we'll add user model
      required: true,
    },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    hostel: { type: String, required: true }, // optional if sellers tied to hostel
  },
  { timestamps: true }
);

const SellerProduct = mongoose.model("SellerProduct", sellerProductSchema);
export default SellerProduct;
