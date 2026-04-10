import { Request, Response } from "express";
import prisma from "../config/dbClient";
import { bucket } from "../googleCloud";
import { v4 as uuidv4 } from "uuid";

import {
    MessageAndSuccessResponseBody, ConversationParticipants
} from "../types/interfaces";

export const addParticipants = async (req: Request, res: Response<ConversationParticipants | MessageAndSuccessResponseBody>) => {
    try {
        const sender = req.body[0];
        const receiver = req.body[1];

        if (!sender || !receiver) {
            return res.status(400).json({
                message: "You must provide sender and receiver",
                success: false,
            });
        }

        const participant1 = await prisma.conversationParticipant.create({
            data: sender
        });

        const participant2 = await prisma.conversationParticipant.create({
            data: receiver
        });

        const conversation_participants = [participant1, participant2];

        return res.status(201).json(conversation_participants);
    } catch (error) {
        return res.status(500).json({
            message: "There was an error adding the participants",
            success: false,
        })
    }
}