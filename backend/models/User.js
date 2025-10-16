// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     passwordHash: { type: String, required: true },
//     role: {
//       type: String,
//       enum: ["user", "seller", "admin"],
//       default: "user",
//     },
//     banned: { type: Boolean, default: false },
//   },

//   { timestamps: true }
// );

// const User = mongoose.model("User", userSchema);
// export default User;










import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "seller", "admin"],
      default: "user",
    },
    banned: { type: Boolean, default: false },

    // --- Seller-specific fields ---
    hostelBlock: { type: String },         // e.g., "A Block"
    roomNumber: { type: String },          // e.g., "B205"
    upiId: { type: String },               // for payouts
    collegeIdUrl: { type: String },        // uploaded ID for verification
    shopName: { type: String },            // optional display name
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    sellerStatus: {
      type: String,
      enum: ["pending_verification", "approved", "rejected"],
      default: "pending_verification",
    },

    // --- Admin-specific fields (optional) ---
    adminLevel: { type: String },          // e.g., "super", "moderator"
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
