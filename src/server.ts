import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import argon2 from "argon2";

import authRoutes from "./routes/auth.js";
import listingRoute from "./routes/listingRoute.js";
import userRoute from "./routes/userRoute.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send("Hello World");
})
app.use("/auth", authRoutes);
app.use("/listing", listingRoute);
app.use("/user", userRoute);

app.listen(PORT, () => {
    console.log(`The server is listening on PORT ${PORT}!`);
});