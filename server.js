const sosRoutes = require("./routes/sosroutes");
const express = require("express");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");

const app = express();

connectDB();

app.use(express.json());

app.use("/api/users", userRoutes);

app.use("/api/sos", sosRoutes);

app.get("/", (req, res) => {
  res.send("Samrakshya Backend Running");
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});