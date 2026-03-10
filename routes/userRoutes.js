const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Register user
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const user = new User({
      name,
      email,
      password
    });

    await user.save();

    res.json({
      message: "User registered successfully",
      user
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// emergency contact
router.post("/add-contact", async (req, res) => {
  try {
    const { email, name, phone } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.emergencyContacts.push({ name, phone });

    await user.save();

    res.json({
      message: "Emergency contact added",
      contacts: user.emergencyContacts
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;