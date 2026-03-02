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
}

export const register_user = async (
    req: Request<{}, {}, RegisterRequestBody>,
    res: Response<AuthResponse>
) => {
    try {
        const { name, email, password } = req.body;

        console.log("i am hitting th eregister reoute")
        console.log(req.body);

        if (!name || !email || !password) {
            return res.status(200).json({
                message: "Name, email or password missing",
                success: false,
            })
        }

        const existing_user = await prisma.user.findUnique({
            where: {
                email: email,
            }
        })

        if (existing_user) {
            console.log("Thjere is a user with this saidd email yeah");
            return res.status(200).json({
                message: "A user with that email already exists",
                success: false,
            })
        }

        const hashed_password = await argon2.hash(password);

        let users_name = (name.trim().slice(0, 1).toUpperCase() + (name.trim().slice(1).toLowerCase()));

        // const user = await prisma.user.create({
        //     data: {
        //         name: users_name,
        //         email,
        //         password: hashed_password,
        //     }
        // })

        // const token = generate_token(user.id);
        //
        // const { password: _, ...safe_user } = user;
        //
        // let filtered_user;
        //
        // if (user.phoneNumber) {
        //     filtered_user = {
        //         id: user.id,
        //         name: user.name,
        //         email: user.email,
        //         phoneNumber: user.phoneNumber,
        //     }
        // }
        //
        // return res.status(201).json({
        //     message: "User has been created successfully",
        //     user: filtered_user,
        //     token,
        //     success: true,
        // })

    } catch (error) {
        return res.status(501).json({
            message: "An unexpected error occurred. Please try again later",
            success: false,
        })
    }
}

export const login_user = async (
    req: Request<{}, {}, LoginRequestBody>,
    res: Response<AuthResponse>
)=> {
    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "User email or password is missing",
                success: false,
            })
        }

        const user = await prisma.user.findUnique({
            where: {
                email: email
            }
        })

        if (!user) {
            return res.status(400).json({
                message: "User not found!",
                success: false,
            })
        }

        const is_password_valid = await argon2.verify(user.password.trim(), password.trim());

        if (!is_password_valid) {
            return res.status(400).json({
                message: "Email and password do not match",
                success: false,
            })
        }

        let filtered_user;

        if (user.phoneNumber) {
            filtered_user = {
                id: user.id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
            }
        }

        const token = generate_token(user.id);

        const { password: _, ...safe_user } = user;

        return res.status(201).json({
            token,
            message: "User has been logged in successfully",
            user: filtered_user,
            success: true,
        })
    } catch (error) {
    }
}

export const logout_user = async (req: Request, res: Response) => {

}