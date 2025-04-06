import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import config from "../config/config";

export async function transcribeAudio(filepath: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", fs.createReadStream(filepath));
  formData.append("language", "english");
  formData.append("response_format", "json");

  const response = await axios.post(config.LEMONFOX_API_URL, formData, {
    headers: {
      Authorization: `Bearer ${config.LEMONFOX_API_KEY}`,
      ...formData.getHeaders(),
    },
  });

  return response.data.text;
}
