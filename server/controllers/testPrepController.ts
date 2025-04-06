import { Request, Response } from "express";
import axios from "axios";
import config from "../config/config";

export async function handleTestPrep(req: Request, res: Response) {
  const { subject, level } = req.query;

  if (!subject) {
    res.status(400).json({ error: "Subject is required" });
    return;
  }

  const prompt = `
Create a comprehensive test preparation guide for ${subject} at the ${
    level || "University"
  } level.
Respond with a JSON object with:
{
  "keyConcepts": [...],
  "formulas": [...],
  "studyStrategies": [...],
  "commonQuestions": [...]
}
`.trim();

  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are an expert academic tutor." },
        { role: "user", content: prompt },
      ],
      temperature: 0.5,
    },
    {
      headers: {
        Authorization: `Bearer ${config.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = response.data.choices?.[0]?.message?.content;

  try {
    res.json({
      subject,
      level: level || "University",
      ...JSON.parse(data),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to parse AI response" });
  }
}
