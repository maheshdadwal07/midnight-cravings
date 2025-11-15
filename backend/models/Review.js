import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    seller_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "flagged", "removed"],
      default: "active",
    },
  },
  { timestamps: true }
);

// Prevent duplicate reviews for same order
reviewSchema.index({ user_id: 1, order_id: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);
export default Review;
