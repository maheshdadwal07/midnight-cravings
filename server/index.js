// server/index.js

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// Load environment variables
dotenv.config();

// Connect MongoDB
connectDB();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// -----------------------------
// ✅ Middleware
// -----------------------------
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads")); // Serve profile/product images

// -----------------------------
// ✅ Routes
// -----------------------------
const authRoutes = require("./routes/auth");         // /api/auth
const userRoutes = require("./routes/user");         // /api/user
const profileRoutes = require("./routes/profile");   // /api/profile
const productRoutes = require("./routes/product");   // /api/products

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/products", productRoutes);

// -----------------------------
// ✅ Root route
// -----------------------------
app.get("/", (req, res) => {
  res.send("🏪 Campus Marketplace API is running!");
});

// -----------------------------
// ✅ Start Server
// -----------------------------
app.listen(PORT, () => {
  console.log(`🚀 Server started at: http://localhost:${PORT}`);
});
