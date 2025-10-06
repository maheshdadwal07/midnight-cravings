import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    sellerProduct_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SellerProduct",
    },
    name: String,
    price: Number,
    quantity: { type: Number, default: 1 },
    image: String,
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [cartItemSchema],
    totalPrice: { type: Number, default: 0 },
  },
  { timestamps: true }
);

cartSchema.methods.calculateTotal = function () {
  this.totalPrice = this.items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  return this.totalPrice;
};

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
