import { config as c } from "dotenv";
c();

class Config {
  public readonly LEMONFOX_API_KEY: string;
  public readonly OPENAI_API_KEY: string;
  public readonly LEMONFOX_API_URL: string;
  public readonly MONGO_URI: string;
  public readonly PORT: number | string;

  constructor() {
    this.LEMONFOX_API_KEY = process.env.LEMONFOX_API_KEY || (() => { throw new Error("LEMONFOX_API_KEY is not defined in .env"); })();
    this.OPENAI_API_KEY = process.env.OPENAI_API_KEY || (() => { throw new Error("OPENAI_API_KEY is not defined in .env"); })();
    this.LEMONFOX_API_URL = "https://api.lemonfox.ai/v1/audio/transcriptions";
    this.MONGO_URI = process.env.MONGO_URI || (() => { throw new Error("MONGO_URI is not defined in .env"); })();
    this.PORT = process.env.PORT || 3000;
  }
}

// Create and export an instance of the Config class
const config = new Config();
export default config;