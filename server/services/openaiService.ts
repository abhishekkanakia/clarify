import axios from "axios";
import config from "../config/config";

export async function generateInsights(text: string): Promise<any> {
  const prompt = `
You are an assistant helping a student understand a lecture. The lecture content is:

"""${text}"""

Please return a JSON object with the following structure:
{
  "summary": "...",
  "key_points": [...],
  "test_questions": [...],
  "glossary": [...],
  "lecture_structure": [...],
  "action_items": [...],
  "study_plan": { ... }
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
        Authorization: `Bearer ${config.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return JSON.parse(response.data.choices[0]?.message?.content || "{}");
}
