import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

const app = express();
app.use(cors());
dotenv.config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 5000;

// const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mydatabase';
// const MONGO_OPTIONS = {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// };

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
