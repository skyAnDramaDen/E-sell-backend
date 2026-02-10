import { Storage } from "@google-cloud/storage";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const keyPath = path.join(__dirname, "..", "serviceAccountKey.json");

export const storage = new Storage({
    keyFilename: keyPath,
});

export const bucket = storage.bucket("frontend-image-bucket-for-12000-native-app");
