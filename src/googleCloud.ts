import { Storage } from "@google-cloud/storage";

export const storage = new Storage({
    projectId: process.env.GCS_PROJECT_ID,
    credentials: {
        client_email: process.env.GCS_CLIENT_EMAIL,
        private_key: process.env.GCS_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
});

export const bucket = storage.bucket("frontend-image-bucket-for-12000-native-app");
