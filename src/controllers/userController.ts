import {Request, Response} from "express";
import prisma from "../config/dbClient.js";
import {bucket} from "../googleCloud.js";
import {v4 as uuid} from "uuid";
import {
    RegisterRequestBody,
    AuthResponse,
    UserDTO,
    LoginRequestBody,
    Product,
    ListingResponseBody,
    Listings,
    Products,
    EditUserResponseBody,
    GetUserResponseBody, MessageAndSuccessResponseBody,
} from "../types/interfaces.js";

import { passwordsMatch, validatePassword } from "../utils/passwordVerifier.js";
import { hash } from "argon2";

export const edit_user = async (req: Request, res: Response<EditUserResponseBody>) => {
    try {
    const {email, name, phoneNumber, id, } = req.body;

    if ((!email && !name && !phoneNumber) && !id) {
        return res.status(400).json({
            success: false,
        })
    }

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
        const files = req.files as Express.Multer.File[];

        let users_image_uri;

        let fileName;
        let blob;

        if (files.length > 0) {
            fileName = `${user.id}_profile_image/${uuid()}.jpg`;
            try {
                blob = bucket.file(fileName);
            } catch (err) {
                return res.status(400).json({
                    message: "Files were not successfully uploaded",
                    success: false,
                });
            }

            try {
                const stream = blob.createWriteStream({
                    resumable: false,
                    metadata: { contentType: files[0].mimetype },
                });

                await new Promise<void>((resolve, reject) => {
                    stream.on("finish", resolve)
                        .on("error", reject)
                        .end(files[0].buffer);
                });

                users_image_uri = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

                if (user.profileImageUri != users_image_uri) {
                    await prisma.user.update({
                        where: {id: id},
                        data: {profileImageUri: users_image_uri},
                    })
                }
            } catch (error) {
                return res.status(400).json({
                    message: "Files were not successfully uploaded",
                    success: false,
                });
            }
        }

        let users_name = (name.trim().slice(0, 1).toUpperCase() + (name.trim().slice(1).toLowerCase()));
        if (user.username != users_name) {
            await prisma.user.update({
                where: {id: id},
                data: {username: users_name},
            });
        }
        let users_email = email.trim();
        if (user.email != users_email) {
            await prisma.user.update({
                where: {id: id},
                data: {email: users_email},
            });
        }

        let users_phone_number = phoneNumber.trim();
        if (user.phoneNumber != users_phone_number) {
            await prisma.user.update({
                where: {id: id},
                data: {phoneNumber: users_phone_number},
            });
        }

        const updated_user = await prisma.user.findUnique({
            where: {
                id: id,
            }
        })

        if (!updated_user) {
            return {
                success: false,
            };
        }

        return res.status(201).json({
            user: updated_user,
            success: true,
        });
    }
} catch (error) {
    return {
        success: false,
        message: error,
    }
}
}

export const get_user = async (req: Request, res: Response<GetUserResponseBody>) => {
    try {
        const {id} = req.body;

        const user = await prisma.user.findUnique({
            where: {id: id},
        });

        if (!user) {
            return res.status(404).json({
                success: false,
            })
        }

        return res.status(200).json({
            user: user,
            success: true,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
        })
    }
}

export const change_user_password = async (req: Request, res: Response<MessageAndSuccessResponseBody>,) => {
    try {
        const { id, password1, password2 } = req.body;

        const user = await prisma.user.findUnique({
            where: {
                id: id,
            }
        })

        if (!user) {
            return res.status(400).json({
                message: "No such user was found",
                success: false,
            })
        }

        if (!password1 || !password2) {
            return res.status(400).json({
                message: "Password missing",
                success: false,
            })
        }

        let passwords_match = passwordsMatch(password1, password2);

        if (!passwords_match) {
            return res.status(400).json({
                message: "The passwords do not match",
                success: false,
            })
        }

        let validate_password1 = validatePassword(password1);

        if (!validate_password1.hasLower) {
            return res.status(400).json({
                message: "Password does not contain a lowercase character!",
                success: false,
            })
        }

        if (!validate_password1.hasSymbol) {
            return res.status(400).json({
                message: "Password does not contain a special character!",
                success: false,
            })
        }

        if (!validate_password1.hasUpper) {
            return res.status(400).json({
                message: "Password does not contain an uppercase character!",
                success: false,
            })
        }

        if (!validate_password1.hasNumber) {
            return res.status(400).json({
                message: "Password does not contain a number!",
                success: false,
            })
        }

        if (!validate_password1.length) {
            return res.status(400).json({
                message: "Password needs to be at least 8 characters long!",
                success: false,
            })
        }

        if (validate_password1.hasSpace) {
            return res.status(400).json({
                message: "Password cannot contain space characters!",
                success: false,
            })
        }

        let usable_password = password1.trim();
        const hashed_password = await hash(usable_password);

        await prisma.user.update({
            where: {id: id},
            data: {password: hashed_password},
        });

        return res.status(200).json({
            message: "Password updated successfully",
            success: true,
        })
    } catch (error) {
        return res.status(500).json({
            message: "Error updating password",
            success: false,
        })
    }
}