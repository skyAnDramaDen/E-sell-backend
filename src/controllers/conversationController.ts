import { Request, Response } from "express";

import {
    MessageAndSuccessResponseBody, Conversations, Conversation, Message, SavedMessage
} from "../types/interfaces";
import {
    fetchAllConversations,
    fetchOneConversation,
    fetchOneConversationByParticipantsId,
    fetchOneConversationLastMessage,
    fetchOneConversationWithLastMessage,
    findOrCreateConversationParticipantsAndMessage,
} from "../services/conversationService";

export const getAllConversations = async (req: Request, res: Response<Conversations | MessageAndSuccessResponseBody>) => {
    try {
        const id = req.body.id;

        if (!id) {
            return res.status(400).json({
                message: "Unauthorized request",
                success: false,
            })
        }

        let allConversations = await fetchAllConversations(id);

        if (allConversations.length === 0) {
            return res.status(201).json({
                message: "There are no conversations at this time",
                success: true,
            })
        }

        return res.status(201).json(allConversations)
    } catch (error) {
        return res.status(201).json({
            message: "There was an error fetching the conversations",
            success: false,
        })
    }
}

export const getConversation = async (req: Request, res: Response<Conversation | MessageAndSuccessResponseBody | null>) => {
    try {
        const {conversationId} = req.body;

        if (!conversationId) {
            return res.status(400).json({
                message: "Unauthorized request",
                success: false,
            })
        }

        let oneConversation = await fetchOneConversation(conversationId);

        return res.status(201).json(oneConversation)
    } catch (error) {
        return res.status(500).json({
            message: "There was an error fetching the conversation",
            success: false,
        })
    }
}

export const getConversationWithLastMessageById = async (req: Request, res: Response) => {
    try {
        const {conversationId} = req.body;

        if (!conversationId) {
            return res.status(400).json({
                message: "Unauthorized request",
                success: false,
            })
        }

        let oneConversation = await fetchOneConversationWithLastMessage(conversationId);

        return res.status(201).json(oneConversation)
    } catch (error) {
        return res.status(500).json({
            message: "There was an error fetching the conversation",
            success: false,
        })
    }
}

export const createConversation = async (req: Request, res: Response<Conversation | MessageAndSuccessResponseBody>) => {
    try {
        const { type, senderId, senderName, receiverId, receiverName } = req.body.payload;

        console.log(type, senderId, senderName, receiverId, receiverName);

        if (!type || !senderName || !senderId || !receiverName || !receiverId) {
            return res.status(400).json({
                message: "There is no type",
                success: false,
            })
        }

        // if (!Object.values(ConversationType).includes(type)) {
        //     return res.status(400).json({
        //         message: "Invalid conversation type",
        //         success: false,
        //     });
        // }
        //
        // const conversation = await prisma.conversation.create({
        //     data: {
        //         type: type,
        //         participant: {
        //             create: [
        //                 {
        //                     userId: senderId,
        //                     name: senderName,
        //                 },
        //                 {
        //                     userId: receiverId,
        //                     name: receiverName,
        //                 }
        //             ]
        //         }
        //     }
        // })
        //
        // if (!conversation) {
        //     return res.status(400).json({
        //         message: "Error creating the conversation",
        //         success: false,
        //     })
        // }
        //
        // const fullConversation = await prisma.conversation.findUnique({
        //     where: { id: conversation.id },
        //     include: {
        //         messages: true,
        //         participant: true,
        //     }
        // });
        //
        // if (!fullConversation) {
        //     return res.status(400).json({
        //         message: "Error fetching the conversation",
        //         success: false,
        //     })
        // }

        let fullConversation: Conversation;
        return res.status(201).json(fullConversation!)

    } catch (error) {
        return res.status(400).json({
            message: "Error creating the conversation",
            success: false,
        })
    }
}

export const createConversationParticipantsAndMessage = async (req: Request, res: Response) => {
    try {
        const { type, buyerId, buyerName, sellerId, sellerName, content } = req.body;
        if (!buyerId || !buyerName || !sellerId || !sellerName || !type || !content) {
            return res.status(400).json({})
        }

        let conversationMessage = await findOrCreateConversationParticipantsAndMessage(type, content, buyerId, buyerName, sellerId, sellerName)

        if (conversationMessage) {
            return res.status(201).json(conversationMessage)
        }
    } catch (error) {
        return res.status(400).json({});
    }
}

export const getConversationByParticipantsId = async (req: Request, res: Response<Conversation | MessageAndSuccessResponseBody | null>) => {
    try {
        const { buyerId, sellerId } = req.body;

        if (!buyerId || !sellerId) {
            res.status(400).json({
                message: "Unauthorized request",
                success: false,
            })
        }

        let fetchedConversation = await fetchOneConversationByParticipantsId(buyerId, sellerId);

        if (!fetchedConversation) {
            return res.status(400).json({
                message: "Error fetching the conversation",
                success: false,
            })
        }

        return res.status(201).json(fetchedConversation);
    } catch (error) {
        return res.status(500).json({
            message: "Error fetching the conversation",
            success: false,
        });
    }
}

export const fetchConversationLastMessage = async (req: Request, res: Response<SavedMessage | MessageAndSuccessResponseBody | null>) => {
    try {
        const { conversationId } = req.body;

        if (!conversationId) {
            res.status(400).json({
                message: "Unauthorized request",
                success: false,
            })
        }

        let fetchedConversationLastMessage = await fetchOneConversationLastMessage(conversationId);
        return res.status(400).json(fetchedConversationLastMessage);
    } catch (error) {
        return res.status(400).json({
            message: "Nothing was found",
            success: false,
        })
    }
}