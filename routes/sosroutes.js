let sosActive = false;

const express = require("express");
const router = express.Router();
const User = require("../models/User");
const SOS = require("../models/sos");


// Trigger SOS
router.post("/trigger", async (req, res) => {
  try {
    const { email, latitude, longitude } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const contacts = user.emergencyContacts;

    if (!contacts || contacts.length === 0) {
      return res.json({ message: "No emergency contacts found" });
    }

    const locationLink = `https://maps.google.com/?q=${latitude},${longitude}`;

    // Save SOS event
    const sosEvent = new SOS({
      email,
      latitude,
      longitude,
      locationLink,
      status: "active"
    });

    await sosEvent.save();

    sosActive = true;

    console.log("🚨 SOS TRIGGERED");
    console.log("Location:", locationLink);

    contacts.forEach((contact, index) => {

      setTimeout(() => {

        if (!sosActive) {
          console.log("SOS already confirmed. Escalation stopped.");
          return;
        }

        const confirmLink = "http://localhost:3000/api/sos/confirm";

        console.log(
          `Alert sent to Contact ${index + 1}: ${contact.name} (${contact.phone})`
        );

        console.log(`
🚨 SOS ALERT
User may be in danger.

Location:
${locationLink}

Confirm alert:
${confirmLink}
        `);

      }, index * 10000); // 10 second escalation delay

    });

    res.json({
      message: "SOS escalation started",
      location: locationLink
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Confirm SOS (stop escalation)
router.get("/confirm", async (req, res) => {

  sosActive = false;

  await SOS.updateMany(
    { status: "active" },
    { status: "confirmed" }
  );

  console.log("✅ SOS CONFIRMED. Escalation stopped.");

  res.send("Alert confirmed. Thank you for responding.");

});


// View SOS history
router.get("/history", async (req, res) => {

  try {

    const history = await SOS.find().sort({ time: -1 });

    res.json(history);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

});


module.exports = router;