const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://samrakshyaUser:pabin12345@samrakshya.bnhyd0k.mongodb.net/?appName=samrakshya");

    console.log("MongoDB Connected");
  } catch (error) {
    console.error("Database connection error:", error);
  }
};

module.exports = connectDB;