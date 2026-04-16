import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

import http from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/auth.js";
import listingRoute from "./routes/listingRoute.js";
import userRoute from "./routes/userRoute.js";
import healthRoute from "./routes/healthRoute.js";
import conversationRoute from "./routes/conversationRoute.js";
import messageRoute from "./routes/messageRoute.js";
import conversationParticipantRoute from "./routes/conversationParticipantRoute";

import {verifyToken} from "./utils/verifyToken";

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;
const ORIGIN_URL = "http://localhost:3000";
const redisUrl = process.env.REDIS_URL;

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: [
            ORIGIN_URL
        ],
        methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
    }
});

const pubClient = createClient({
    url: redisUrl,
})

const subClient = pubClient.duplicate();

async function connectClients() {
    await Promise.all([
        pubClient.connect(),
        subClient.connect(),
    ])
}

connectClients();

io.adapter(createAdapter(pubClient, subClient));

const secret = process.env.JWT_SECRET || "klxnfohfe489rhinhrn9hrq3foh5873of5o387t5y37g8r@@";

let conversations: any[] = [];
let messages: any[] = [];

io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
        return next(new Error("No token provided"));
    }

    try {
        const user = verifyToken(token, secret);

        if (!user) {
            return next(new Error("Unauthorized"));
        }

        socket.data.user = user;
        next();
    } catch (err) {
        return next(new Error("Unauthorized"));
    }
});

io.on("connection", (socket) => {
    const user = socket.data.user;

    if (!user) {
        socket.disconnect();
        return;
    }

    const user_id: string = user.id;

    const userKey = `user:online:${user_id}`;

    const handleConnection = async () => {
        try {
            await pubClient.sAdd(userKey, socket.id);

            await pubClient.sAdd("total_online_users", String(user_id));

            const total = await pubClient.sCard("total_online_users");

            io.emit("no_of_current_users", { "total_users": total })
        } catch (error) {
            console.log("Redis connection error.")
        }
    }

    handleConnection();

    // addOnlineUser(user_id, socket.id);

    // emitOnlineUsers(io);

    socket.on("join_conversation", (conversationId: number) => {
        const room = `conversation_${conversationId}`;

        socket.join(room);
    });

    socket.on("leave_conversation", (conversationId: number) => {
        const room = `conversation_${conversationId}`;

        socket.leave(room);
    })

    socket.on("send_message", (data) => {
        const { message } = data;

        messages.push(message);

        io.to(`conversation_${message.conversationId}`).emit("receive_message", message);
    });

    socket.on("typing", (conversationId: number) => {
        socket.to(`conversation_${conversationId}`)
            .emit("user_typing", {
                user_id
            });
    });

    socket.on("stop_typing", (conversationId: number) => {
        socket.to(`conversation_${conversationId}`)
            .emit("user_stop_typing", {
                user_id
            });
    });

    // socket.on("disconnect", () => {
    //     removeOnlineUser(user_id, socket.id);

    //     emitOnlineUsers(io);
    // });
    socket.on("disconnect", () => {
        const handleDisconnection = async () => {
            try {
                await pubClient.sRem(userKey, socket.id)

                const remaining = await pubClient.sCard(userKey);

                if (remaining === 0) {
                    await pubClient.sRem("total_online_users", String(user_id));
                }

                io.emit("user_offline", { user_id });
            } catch (error) {
                console.log("Redis connection error");
            }
        }

        handleDisconnection();
    })
});

app.use(cors(
    {
        origin: [
            "http://localhost:19006",
            "http://localhost:8082",
            "http://172.16.9.189:19006"
        ],
        credentials: true,
    }
));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    return res.status(200).send("Hello World");
})
app.use("/auth", authRoutes);
app.use("/listing", listingRoute);
app.use("/user", userRoute);
app.use("/health", healthRoute);
app.use("/conversation", conversationRoute);
app.use("/message", messageRoute);
app.use("/conversationParticipant", conversationParticipantRoute);

server.listen(Number(PORT), "0.0.0.0",() => {
    console.log(`Server running on port ${PORT}`);
});