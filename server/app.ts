import express from "express";
import type { Request, Response } from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import path from "path";
import axios from "axios";
import FormData from "form-data";
import Config from "./config/config.ts";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Constants
const UPLOAD_FOLDER = "uploads";
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

// Create uploads directory if it doesn't exist
if (!fs.existsSync(UPLOAD_FOLDER)) {
  fs.mkdirSync(UPLOAD_FOLDER, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_FOLDER);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

/**
 * Generates full lecture insights using OpenAI
 * @param text The transcribed lecture text
 * @returns Promise<object> AI-generated lecture insights
 */
async function generateInsights(text: string): Promise<any> {
  if (!text || text.trim().length === 0) {
    throw new Error("Text cannot be empty");
  }

  try {
    const prompt = `
You are an assistant helping a student understand a lecture. The lecture content is:

"""${text}"""

Please return a JSON object with the following structure:

{
  "summary": "Concise summary of the lecture",
  "key_points": ["Bullet point 1", "Bullet point 2", "..."],
  "test_questions": ["What is...?", "How does...?", "..."],
  "glossary": [{ "term": "Term1", "definition": "..." }, { "term": "Term2", "definition": "..." }],
  "lecture_structure": ["00:00 - Intro to...", "03:25 - Discussion on..."],
  "action_items": ["Review concept A", "Practice problem B"],
  "study_plan": {
    "Day 1": "Review notes + glossary",
    "Day 2": "Practice questions + reread summary"
  }
}
Only return valid JSON. Do not include extra explanation.
    `.trim();

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 800,
        temperature: 0.5,
      },
      {
        headers: {
          Authorization: `Bearer ${Config.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 20000,
      }
    );

    const jsonText = response.data.choices?.[0]?.message?.content ?? "";
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error generating insights:", error);
    throw new Error(
      `Failed to generate insights: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * POST /transcribe
 * Transcribes audio file and provides AI-powered lecture insights
 */
app.post(
  "/transcribe",
  upload.single("file"),
  async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: "No file uploaded",
      });
      return;
    }

    const filepath = path.join(UPLOAD_FOLDER, req.file.filename);
    console.log("File uploaded to:", filepath);

    try {
      if (!fs.existsSync(filepath)) {
        throw new Error("Uploaded file not found");
      }

      const fileStats = fs.statSync(filepath);
      if (fileStats.size === 0) {
        throw new Error("Uploaded file is empty");
      }

      const fileStream = fs.createReadStream(filepath);
      const formData = new FormData();
      formData.append("file", fileStream);
      formData.append("language", "english");
      formData.append("response_format", "json");

      const headers = {
        Authorization: `Bearer ${Config.LEMONFOX_API_KEY}`,
        ...formData.getHeaders(),
      };

      const response = await axios.post(Config.LEMONFOX_API_URL, formData, {
        headers,
        timeout: 30000,
      });

      const transcribedText = response.data.text;

      let insights = {};
      if (transcribedText.trim().length > 0) {
        insights = await generateInsights(transcribedText);
      }

      console.log(insights);

      res.json({
        success: true,
        full_transcription: transcribedText,
        insights,
      });
    } catch (error) {
      console.error("Error processing transcription:", error);
      res.status(500).json({
        success: false,
        error: "Failed to process transcription",
        details: error instanceof Error ? error.message : String(error),
      });
    } finally {
      try {
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }
      } catch (cleanupError) {
        console.error("Error cleaning up file:", cleanupError);
      }
    }
  }
);

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

const PORT = Config.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
