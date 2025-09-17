
const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/authController");

// ✅ Register new user
router.post("/register", registerUser);

// ✅ Login existing user
router.post("/login", loginUser);

// ❌ Don't put profile routes here

module.exports = router;
