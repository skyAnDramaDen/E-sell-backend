import { Request, Response } from "express";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import prisma from "../config/dbClient.js";

import { RegisterRequestBody, AuthResponse, UserDTO, LoginRequestBody } from "../types/interfaces.js";
import {hash} from "crypto";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

if (!JWT_EXPIRES_IN || !JWT_SECRET) {
    throw new Error("JWT_EXPIRES_IN or JWT secret not available");
}

function generate_token (user_id: string) : string {
    const payload: { id: string } = { id: user_id };
    const options: jwt.SignOptions = { expiresIn: Number(JWT_EXPIRES_IN) };

    return jwt.sign(payload, JWT_SECRET as string, options);

    // return jwt.sign(
    //     { id: user_id } ,
    //     JWT_SECRET as string,
    //     {
    //         expiresIn: JWT_EXPIRES_IN
    //     }
    // );
}

export const register_user = async (
    req: Request<{}, {}, RegisterRequestBody>,
    res: Response<AuthResponse>
) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email or password missing"
            })
        }

        const existing_user = await prisma.user.findUnique({
            where: {
                email: email,
            }
        })

        if (existing_user) {
            return res.status(400).json({
                message: "A user with that email already exists",
            })
        }

        const hashed_password = await argon2.hash(password);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashed_password,
            }
        })

        const token = generate_token(user.id);

        const { password: _, ...safe_user } = user;


        return res.status(201).json({
            message: "User has been created successfully",
            user,
            token,
        })

    } catch (error) {
        return res.status(501).json({
            message: "An unexpected error occurred. Please try again later"
        })
    }
}

export const login_user = async (
    req: Request<{}, {}, LoginRequestBody>,
    res: Response<AuthResponse | { message: string }>
)=> {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "User email or password is missing",
            })
        }

        const user = await prisma.user.findUnique({
            where: {
                email: email
            }
        })

        if (!user) {
            return res.status(400).json({
                message: "User not found!"
            })
        }

        const is_password_valid = await argon2.verify(user.password.trim(), password.trim());

        if (!is_password_valid) {
            return res.status(400).json({
                message: "Invalid password!"
            })
        }

        const token = generate_token(user.id);

        const { password: _, ...safe_user } = user;

        return res.status(201).json({
            token,
            message: "User has been logged in successfully",
            user
        })
    } catch (error) {
    }
}