import express from "express";
import dotenv from "dotenv";
import cors from "cors";

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

const secret = process.env.JWT_SECRET || "klxnfohfe489rhinhrn9hrq3foh5873of5o387t5y37g8r@@";

let conversations: any[] = [];
let messages: any[] = [];

const onlineUsers: Map<number, Set<string>> = new Map();

function addOnlineUser(userId: number, socketId: string) {
    if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
    }

    onlineUsers.get(userId)!.add(socketId);
}

function removeOnlineUser(userId: number, socketId: string) {
    const sockets = onlineUsers.get(userId);

    if (!sockets) return;

    sockets.delete(socketId);

    if (sockets.size === 0) {
        onlineUsers.delete(userId);
    }
}

function emitOnlineUsers(io: Server) {
    const users = Array.from(onlineUsers.keys());

    io.emit("online_users", users);
}

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

        (socket as any).user = user;
        next();
    } catch (err) {
        next(new Error("Unauthorized"));
    }
});

io.on("connection", (socket) => {

    const user = (socket as any).user;

    if (!user) {
        socket.disconnect();
        return;
    }

    const user_id: number = user.id;

    addOnlineUser(user_id, socket.id);

    emitOnlineUsers(io);

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

    socket.on("disconnect", () => {
        removeOnlineUser(user_id, socket.id);

        emitOnlineUsers(io);
    });
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