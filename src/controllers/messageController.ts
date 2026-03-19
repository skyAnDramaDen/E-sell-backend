import { Request, Response } from "express";
import prisma from "../config/dbClient";
import {
    MessageAndSuccessResponseBody
} from "../types/interfaces";
import {Message} from "@prisma/client";

export const send_message = async (req: Request, res: Response<Message | MessageAndSuccessResponseBody>) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                message: "There is no message",
                success: false,
            })
        }

        const created_message = await prisma.message.create({
            data: message
        })

        if (!created_message) {
            return res.status(400).json({
                message: "Failed to create message",
                success: false,
            })
        }

        return res.status(201).json(created_message)
    } catch (error) {
        return res.status(500).json({
            message: "There was an error sending the message",
            success: false,
        })
    }
}