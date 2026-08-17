import prisma from "../config/dbClient";
import {Conversations, Conversation, MessageAndSuccessResponseBody, Message, SavedMessage} from "../types/interfaces";
import {ConversationType} from "@prisma/client";

export async function fetchAllConversations(id: string): Promise<Conversations> {
    try {
        const conversations = await prisma.conversation.findMany({
            where: {
                type: "SELLER_BUYER",
                participants: {
                    some:{
                        userId: id,
                    }
                }
            },
            include: {
                messages: true,
                participants: true
            },
        });

        return conversations;
    } catch (error: any) {
        console.log(error);
        return error;
    }
}

export async function fetchOneConversation (id: string): Promise<Conversation | MessageAndSuccessResponseBody | null> {
    try {
        const conversation = await prisma.conversation.findUnique({
            where: {
                id: id,
            },
            include: {
                messages: true,
                participants: true,
            },
        })

        return conversation;
    } catch (error: any) {
        console.log(error);
        return error;
    }
}

export async function fetchOneConversationWithLastMessage (id: string): Promise<Conversation | MessageAndSuccessResponseBody | null> {
    try {
        if (!id) {
            return null;
        }
        const conversation = await prisma.conversation.findUnique({
            where: {
                id: id,
            },
            include: {
                messages: {
                    orderBy: {
                        createdAt: "desc",
                    },
                    take: 1,
                },
                participants: true,
            },
        })

        return conversation;
    } catch (error: any) {
        console.log(error);
        return error;
    }
}

export async function fetchOneConversationByParticipantsId (senderId: string, receiverId: string): Promise<Conversation | null> {
    try {
        const conversation = await prisma.conversation.findFirst({
            where: {
                type: "SELLER_BUYER",
                AND: [
                    { participants: { some: { userId: senderId } } },
                    { participants: { some: { userId: receiverId } } }
                ]
            },
            include: {
                messages: true,
                participants: true
            }
        });

        return conversation;
    } catch (error: any) {
        return error;
    }
}

export async function findOrCreateANewConversationAndReturnLastMessage (type: ConversationType, content: string, senderId: string, senderName: string, receiverId: string, receiverName: string): Promise<SavedMessage> {
    try {
        let existingConversation = await prisma.conversation.findFirst({
            where: {
                type: "SELLER_BUYER",
                AND: [{ participants: { some: { userId: senderId } } }, { participants: { some: { userId: receiverId } } }]
            },
            include: {
                messages: true,
                participants: true
            }
        });

        if  (existingConversation) {
            const updatedExistingConversation = await prisma.conversation.update({
                where: {
                    id: existingConversation.id
                },
                data: {
                    messages: {
                        create: [{ content: content, senderId: senderId }]
                    }
                },
                include: {
                    messages: {
                        orderBy: {
                            createdAt: "desc"
                        },
                        take: 1,
                        include: { sender: { select: { id: true, username: true } } }
                    }
                }
            })

            return updatedExistingConversation.messages[0]
        } else {
            const conversation = await prisma.conversation.create({
                data: {
                    type: type,
                    participants: {
                        create: [{ userId: senderId, name: senderName }, { userId: receiverId, name: receiverName }]
                    },
                    messages: {
                        create: [{ content: content, senderId: senderId }]
                    }
                },
                include:{
                    messages:{
                        orderBy: {
                            createdAt: "desc"
                        },
                        take: 1,
                        include: {
                            sender: { select: { username: true, id: true, } }
                        }
                    }
                }
            })
            return conversation.messages[0];
        }
    } catch (error: any) {
        return error;
    }
}

export async function fetchOneConversationLastMessage (conversationId: string): Promise<SavedMessage | null> {
    try {
        let conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
            },
            include: {
                messages:{
                    orderBy: {
                        createdAt: "desc"
                    },
                    take: 1,
                    include: {
                        sender: {
                            select: {
                                username: true,
                                id: true,
                            }
                        }
                    }
                }
            }
        })

        if (conversation) {
            return conversation.messages[0];
        } else {
            return null;
        }
    } catch (error: any) {
        return error;
    }
}

export async function findOrCreateConversationAndParticipants (type: ConversationType, buyerId: string, buyerName: string, sellerId: string, sellerName: string) {
    try {
        const existingConversation = await prisma.conversation.findFirst({
            where: {
                type: type,
                AND: [
                    { participants: { some: { userId: buyerId } } },
                    { participants: { some: { userId: sellerId } } }
                ]
            }
        })

        if  (existingConversation) {
            return existingConversation.id;
        } else {
            const newConversation = await prisma.conversation.create({
                data: {
                    type: type,
                    participants: {
                        create: [
                            { userId: buyerId, name: buyerName },
                            { userId: sellerId, name: sellerName },
                        ]
                    }
                }
            })
            console.log("findOrCreateConversationAndParticipants", newConversation.id)
            return newConversation.id;
        }
    } catch (error: any) {
        return error;
    }
}