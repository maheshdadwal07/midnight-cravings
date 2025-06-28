const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const protectedRoutes = require("./routes/protected");
const userRoutes = require("./routes/user");
const profileRoutes = require("./routes/profile");

// Load env variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Use route
app.use("/api/auth", authRoutes);
app.use("/api", protectedRoutes);
app.use("/api/user", userRoutes);
app.use("/api/profile", profileRoutes);
app.use("/uploads", express.static("uploads"));// profile pic public banani ke liye

// Sample Route
app.get("/", (req, res) => {
  res.send("Campus Marketplace API is running 🛍️");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
