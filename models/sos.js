const mongoose = require("mongoose");

const sosSchema = new mongoose.Schema({
  email: String,
  latitude: Number,
  longitude: Number,
  locationLink: String,
  status: {
    type: String,
    default: "active"
  },
  time: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("SOS", sosSchema);