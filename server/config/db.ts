import mongoose from "mongoose";
import logger from "../utils/logger"
import Config from "./config";

const connectDB = async () => {
  console.log(process.env.MONGO_URI);
  try {
    await mongoose.connect(Config.MONGO_URI);
    logger.info("MongoDB connected");
  } catch (err) {
    logger.error(`MongoDB connection error: ${err}`);
    process.exit(1);
  }
};

module.exports = connectDB;