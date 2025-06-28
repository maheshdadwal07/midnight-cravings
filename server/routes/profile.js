const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware"); // yeh line update karni hai
const User = require("../models/User");
const upload = require("../middleware/upload");

// ✅ Update profile route
router.put("/update", auth, upload.single("profilePic"), async (req, res) => {
  try {

     console.log("REQ BODY:", req.body); // 🧪 log form fields
    console.log("REQ FILE:", req.file); // 🧪 log uploaded file
    const user = await User.findById(req.user.id);

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.gender = req.body.gender || user.gender;

    if (req.file) {
      user.profilePic = `http://localhost:5000/uploads/${req.file.filename}`;
    }

    await user.save();
    res.json({ message: "Profile updated", user });
  } catch (err) {
      console.error("Update Error:", err);
    res.status(500).json({ message: "Update failed" });
  }
});

router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user data" });
  }
});

module.exports = router;
