import fs from "fs";

export const ensureUploadFolderExists = (uploadFolder: string): void => {
  if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, { recursive: true });
  }
};

export const deleteFileIfExists = (filepath: string): void => {
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
  }
};
