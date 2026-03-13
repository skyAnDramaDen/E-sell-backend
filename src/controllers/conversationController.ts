import { Request, Response } from "express";
import prisma from "../config/dbClient";

import {
    MessageAndSuccessResponseBody, Conversations, Conversation
} from "../types/interfaces";
import {ConversationType} from "@prisma/client";

export const get_all_conversations = async (req: Request, res: Response<Conversations | MessageAndSuccessResponseBody>) => {
    try {
        const id = req.body.id;

        if (!id) {
            return res.status(400).json({
                message: "There are no conversations now ",
                success: false,
            })
        }

        const conversations = await prisma.conversation.findMany({
            where: {
                type: "SELLER_BUYER",
                participant: {
                    some:{
                        userId: id,
                    }
                }
            },
            include: {
                messages: true,
                participant: true
            },
        });

        if (conversations.length === 0) {
            return res.status(201).json({
                message: "There are no conversations at this time",
                success: true,
            })
        }

        return res.status(201).json(conversations)
    } catch (error) {
        return res.status(201).json({
            message: "There was an error fetching the conversations",
            success: false,
        })
    }
}

export const get_conversation = async (req: Request, res: Response<Conversation | MessageAndSuccessResponseBody>) => {
    try {
        const conversationId = req.body.conversationId;

        if (!conversationId) {
            return res.status(400).json({
                message: "There is no id value",
                success: false,
            })
        }

        const conversation = await prisma.conversation.findUnique({
            where: {
                id: conversationId,
            },
            include: {
                messages: true,
                participant: true
            },
        })

        if (!conversation) {
            return res.status(400).json({
                message: "No such conversation exists",
                success: false,
            })
        }

        return res.status(201).json(conversation)
    } catch (error) {
        return res.status(500).json({
            message: "There was an error fetching the conversation",
            success: false,
        })
    }
}

export const create_conversation = async (req: Request, res: Response<Conversation | MessageAndSuccessResponseBody>) => {
    try {
        const { type } = req.body.payload;

        if (!type) {
            return res.status(400).json({
                message: "There is no type",
                success: false,
            })
        }

        if (!Object.values(ConversationType).includes(type)) {
            return res.status(400).json({
                message: "Invalid conversation type",
                success: false,
            });
        }

        const conversation = await prisma.conversation.create({
            data: {
                type: type,
            }
        })

        if (!conversation) {
            return res.status(400).json({
                message: "Error creating the conversation",
                success: false,
            })
        }

        const fullConversation = await prisma.conversation.findUnique({
            where: { id: conversation.id },
            include: {
                messages: true,
                participant: true,
            }
        });

        if (!fullConversation) {
            return res.status(400).json({
                message: "Error fetching the conversation",
                success: false,
            })
        }

        return res.status(201).json(fullConversation)

    } catch (error) {
        return res.status(400).json({
            message: "Error creating the conversation",
            success: false,
        })
    }
}

export const get_conversation_by_participants_id = async (req: Request, res: Response<Conversation | MessageAndSuccessResponseBody>) => {
    try {
        const { buyerId, sellerId } = req.body;

        if (!buyerId || !sellerId) {
            res.status(400).json({
                message: "There is no id value",
                success: false,
            })
        }

        const conversation = await prisma.conversation.findFirst({
            where: {
                type: "SELLER_BUYER",
                AND: [
                    { participant: { some: { userId: buyerId } } },
                    { participant: { some: { userId: sellerId } } }
                ]
            },
            include: {
                messages: true,
                participant: true
            }
        });

        if (!conversation) {
            return res.status(400).json({
                message: "Error fetching the conversation",
                success: false,
            })
        }

        return res.status(201).json(conversation);
    } catch (error) {
        return res.status(500).json({
            message: "Error fetching the conversation",
            success: false,
        });
    }
}