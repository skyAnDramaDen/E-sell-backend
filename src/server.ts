import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import argon2 from "argon2";

import authRoutes from "./routes/auth.js";
import listingRoute from "./routes/listingRoute.js";
import userRoute from "./routes/userRoute.js";
import healthRoute from "./routes/healthRoute.js";

dotenv.config();

const app = express();

const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send("Hello World");
})
app.use("/auth", authRoutes);
app.use("/listing", listingRoute);
app.use("/user", userRoute);
app.use("/health", healthRoute);

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});