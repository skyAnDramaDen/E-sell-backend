import { Request, Response } from "express";
import {
    MessageAndSuccessResponseBody
} from "../types/interfaces";
import {Message} from "@prisma/client";
import {saveMessageFunction} from "../services/messageService";

export const sendMessage = async (req: Request, res: Response<Message | MessageAndSuccessResponseBody>) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                message: "There is no message",
                success: false,
            })
        }

        const newlySavedMessage = await saveMessageFunction(message);

        if (!newlySavedMessage) {
            return res.status(400).json({
                message: "Failed to create message",
                success: false,
            })
        }

        return res.status(201).json(newlySavedMessage)
    } catch (error) {
        return res.status(500).json({
            message: "There was an error sending the message",
            success: false,
        })
    }
}