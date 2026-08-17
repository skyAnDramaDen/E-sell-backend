import prisma from "../config/dbClient";
import {saveMessagePayload} from "../types/interfaces";

export async function saveMessageFunction (payload: saveMessagePayload) {
    try {
        const created_message = await prisma.message.create({
            data: payload,
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true,
                    }
                }
            }
        })

        return created_message;
    } catch (error: any) {
        console.log(error);
        return error;
    }
}