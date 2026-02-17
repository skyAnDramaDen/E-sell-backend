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
    GetUserResponseBody,
} from "../types/interfaces.js";

export const edit_user = async (req: Request, res: Response<EditUserResponseBody>) => {
    try {
    const {email, name, phoneNumber, id, } = req.body;

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
            users_image_uri = `${user.id}_profile_image/${uuid()}.jpg`;
            fileName = users_image_uri;
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
        if (user.name != users_name) {
            await prisma.user.update({
                where: {id: id},
                data: {name: users_name},
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
        const {id} = req.params;

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