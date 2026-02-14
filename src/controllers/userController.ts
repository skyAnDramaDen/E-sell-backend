import { Request, Response } from "express";
import prisma from "../config/dbClient.js";
import { bucket } from "../googleCloud.js";
import { v4 as uuid } from "uuid";
import {
    RegisterRequestBody,
    AuthResponse,
    UserDTO,
    LoginRequestBody,
    Product,
    ListingResponseBody,
    Listings,
    Products,
    EditUserResponseBody
} from "../types/interfaces.js";

export const edit_user = async (req: Request, res: Response): Promise<EditUserResponseBody> => {
    try {
        const { email, name, phoneNumber, id } = req.body;

        const user = await prisma.user.findUnique({
            where: {
                id: id,
            }
        })

        if (!user) {
            return {
                success: false,
            };
        } else {
            let users_name = (user.name.trim().slice(0, 1).toUpperCase() + (user.name.trim().slice(1).toLowerCase()));
            if (user.name != name) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { name },
                });
            }

            if (user.email != email) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { email },
                });
            }

            if (user.phoneNumber != phoneNumber) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { phoneNumber },
                });
            }

            return {
                success: true,
            };
        }
    } catch (error) {
        return {
            success: false,
            message: error,
        }
    }
}