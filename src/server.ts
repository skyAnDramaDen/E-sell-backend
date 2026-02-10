import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import argon2 from "argon2";

import authRoutes from "./routes/auth.js";
import listingRoute from "./routes/listingRoute.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    // console.log("GET /");

    res.send("Hello World");
})
app.use("/auth", authRoutes);
app.use("/listing", listingRoute)

app.listen(PORT, () => {
    console.log(`The server is listening on PORT ${PORT}!`);
});