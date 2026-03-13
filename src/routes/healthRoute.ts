import { Router } from "express";
import prisma from "../config/dbClient.js";
import { storage } from "../googleCloud.js";

const router = Router();

router.get("/", async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;

        const bucketName = process.env.GCS_BUCKET_NAME;
        if (!bucketName) {
            res.status(200).json({
                status: "error",
                db: "unknown",
                gcs: "unknown",
                error: "There is no bucket",
            });
        } else {
            const [exists] = await storage.bucket(bucketName).exists();

            if (!exists) throw new Error(`Bucket ${bucketName} not accessible`);

            res.status(200).json({
                status: "ok",
                db: "connected",
                gcs: "connected",
            });
        }
    } catch (err: any) {
        console.error("Health check failed:", err);
        res.status(500).json({
            status: "error",
            db: "unknown",
            gcs: "unknown",
            error: err.message,
        });
    }
});

export default router;