import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import testPrepRoutes from "./routes/testPrepRoutes";
import transcribeRoutes from "./routes/transcribeRoutes";
import config from "./config/config";
dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/transcribe", transcribeRoutes);
app.use("/test-prep", testPrepRoutes);

app.get("/health", (_req, res) => {
  res
    .status(200)
    .json({ status: "healthy", timestamp: new Date().toISOString() });
});

const PORT = config.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
