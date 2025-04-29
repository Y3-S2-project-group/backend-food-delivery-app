import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import notificationRoutes from "./routes/notificationRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/notifications", notificationRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Notification Service running on port ${PORT}`);
});