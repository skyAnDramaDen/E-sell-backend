import { Request, Response } from "express";
import { hash, verify } from "argon2";
import prisma from "../config/dbClient";

import {generateToken} from "../utils/generateToken";

import { RegisterRequestBody, AuthResponse, UserDTO, LoginRequestBody } from "../types/interfaces.js";

export const register_user = async (
    req: Request<{}, {}, RegisterRequestBody>,
    res: Response<AuthResponse>
) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
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
            return res.status(400).json({
                message: "A user with that email already exists",
                success: false,
            })
        }

        const hashed_password = await hash(password);

        let users_name = (username.trim().slice(0, 1).toUpperCase() + (username.trim().slice(1).toLowerCase()));

        const user = await prisma.user.create({
            data: {
                username: users_name,
                email,
                password: hashed_password,
            }
        })

        if (!user) {
            return res.status(404).json({
                message: "No user was created",
                success: false,
            })
        }

        const token = await generateToken(user.id);

        const { password: _, ...safe_user } = user;

        let filtered_user = {
            id: user.id,
            username: user.username,
            email: user.email,
            phoneNumber: user.phoneNumber || "",
        }

        return res.status(201).json({
            message: "User has been created successfully",
            user: filtered_user,
            token,
            success: true,
        })

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

        const is_password_valid = await verify(user.password.trim(), password.trim());

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
                username: user.username,
                email: user.email,
                phoneNumber: user.phoneNumber,
            }
        }

        const token = generateToken(user.id);

        const { password: _, ...safe_user } = user;

        return res.status(201).json({
            token,
            message: "User has been logged in successfully",
            user: filtered_user,
            success: true,
        })
    } catch (error) {
        return res.status(501).json({
            message: "there was a server error",
            success: false,
        })
    }
}

export const logout_user = async (req: Request, res: Response) => {

}