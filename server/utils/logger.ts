import fs from "fs";
import { createLogger, format, transports, Logger } from "winston";
import { TransformableInfo } from "logform";
const { combine, timestamp, printf, colorize } = format;

const logDir = "logs";
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logFormat = printf((info: TransformableInfo) => {
  const { level, message, timestamp } = info as {
    level: string;
    message: string;
    timestamp?: string;
  };
  return `${timestamp || "No Timestamp"} [${level.toUpperCase()}]: ${message}`;
});

const logger: Logger = createLogger({
  level: "info",
  format: combine(timestamp(), logFormat),
  transports: [
    new transports.Console({
      format: combine(colorize(), logFormat),
    }),
    new transports.File({ filename: `${logDir}/error.log`, level: "error" }),
    new transports.File({ filename: `${logDir}/combined.log` }),
  ],
});

export default logger;
