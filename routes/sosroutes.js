const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.post("/trigger", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const contacts = user.emergencyContacts;

    if (contacts.length === 0) {
      return res.json({ message: "No emergency contacts found" });
    }

    console.log("🚨 SOS TRIGGERED");

    contacts.forEach((contact, index) => {
      console.log(`Alert sent to Contact ${index + 1}: ${contact.name} (${contact.phone})`);
    });

    res.json({
      message: "SOS alerts sent",
      contacts
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;