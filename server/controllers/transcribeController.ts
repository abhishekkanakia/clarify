import { Request, Response } from "express";
import path from "path";
import { generateInsights } from "../services/openaiService";
import { transcribeAudio } from "../services/lemonfoxService";
import { deleteFileIfExists } from "../utils/fileUtils";

const UPLOAD_FOLDER = "uploads";

export async function handleTranscription(
  req: Request,
  res: Response
): Promise<void> {
  if (!req.file) {
    res.status(400).json({ success: false, error: "No file uploaded" });
    return;
  }

  const filepath = path.join(UPLOAD_FOLDER, req.file.filename);

  try {
    const transcribedText = await transcribeAudio(filepath);
    const insights = await generateInsights(transcribedText);

    res.json({
      success: true,
      full_transcription: transcribedText,
      insights,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to process transcription",
      details: error instanceof Error ? error.message : String(error),
    });
  } finally {
    deleteFileIfExists(filepath);
  }
}
