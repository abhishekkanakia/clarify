import express from "express";
import multer from "multer";
import path from "path";
import { handleTranscription } from "../controllers/transcribeController";
import { ensureUploadFolderExists } from "../utils/fileUtils";

const router = express.Router();
const UPLOAD_FOLDER = "uploads";
ensureUploadFolderExists(UPLOAD_FOLDER);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_FOLDER),
  filename: (_req, file, cb) =>
    cb(
      null,
      Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        path.extname(file.originalname)
    ),
});

const upload = multer({ storage, limits: { fileSize: 25 * 1024 * 1024 } });

router.post("/", upload.single("file"), handleTranscription);

export default router;
