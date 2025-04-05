import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import axios from "axios";
import Config from "./config/config.ts";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * GET /test-prep
 * Generates comprehensive test preparation material for a given subject
 */
app.get("/test-prep", async (req: Request, res: Response) => {
  try {
    const { subject, level } = req.query;

    if (!subject) {
      res.status(400).json({ error: "Subject is required" });
      return;
    }

    const prompt = `
Create a comprehensive test preparation guide for ${subject} at the ${
      level || "University"
    } level.
Respond with a JSON object containing the following sections:

1. keyConcepts: Array of 5-8 most important concepts the student should master
2. formulas: Array of key formulas, equations, or essential facts
3. studyStrategies: Array of 3-5 effective study techniques for this subject
4. commonQuestions: Array of 4-6 common test questions or problem types

Format your response as a valid JSON object with only these properties. Do not include any additional commentary or explanations outside of the JSON structure.
`.trim();

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are an expert academic tutor creating test preparation materials. Respond with a valid JSON object containing only the requested properties.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.5,
        response_format: { type: "json_object" },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const prepMaterial = response.data.choices[0]?.message?.content;

    if (!prepMaterial) {
      res
        .status(500)
        .json({ error: "Failed to generate test preparation material" });
      return;
    }

    let testPrepData;
    try {
      testPrepData = JSON.parse(prepMaterial);
    } catch (error) {
      console.error("Error parsing JSON response:", error);
      res
        .status(500)
        .json({ error: "Failed to parse test preparation material" });
      return;
    }

    res.json({
      subject,
      level: level || "University",
      ...testPrepData,
    });
  } catch (error) {
    console.error("Error generating test prep:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

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
