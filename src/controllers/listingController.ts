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
    Products
} from "../types/interfaces.js";

export const create_listing = async (req: Request, res: Response<ListingResponseBody>) => {
    try {
        req.body.price = Number(req.body.price);

        const product = await prisma.product.create({
            data: req.body,
        })

        const files = req.files as Express.Multer.File[];

        if (!files || files.length === 0) {
            return res.status(400).json({ message: "No files uploaded" });
        }

        let imageUrls: string[] = [];

        for (const file of files) {
            const fileName = `${product.id}/${uuid()}.jpg`;
            let blob;
            try {
                blob = bucket.file(fileName);
            } catch (err) {
                await prisma.product.delete({
                    where: {
                        id: product.id,
                    }
                })
                return res.status(500).json({ message: "Error accessing GCS bucket"});
            }

            try {
                const stream = blob.createWriteStream({
                    resumable: false,
                    metadata: { contentType: file.mimetype },
                });

                await new Promise<void>((resolve, reject) => {
                    stream.on("finish", resolve)
                        .on("error", reject)
                        .end(file.buffer);
                });
            } catch (error) {
                await prisma.product.delete({
                    where: {
                        id: product.id,
                    }
                })
                return res.status(500).json({ message: "Error uploading file"});
            }

            // Make the uploaded file public
            // await blob.makePublic();

            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
            imageUrls.push(publicUrl);
        }

        return res.json({
            product: product,
            message: "The listing was created successfully"
        });
    } catch (error) {
        return res.json({
            message: "This is a message"
        })
    }
}

export const get_listing = async (req: Request, res: Response<ListingResponseBody>) => {
    try {
        const product_id = req.params.id;

        const product = await prisma.product.findUnique({
            where: {
                id: product_id,
            }
        })

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const [files] = await bucket.getFiles({
            prefix: `${product_id}/`,
        })

        const imageUrls = files.map(file => file.publicUrl());

        return res.status(200).json({
            product: product,
            images: imageUrls,
            message: "This has been successful"
        });
    } catch (error) {
    }
}

export const get_all_listings = async (req: Request, res: Response<Listings>) => {
    try {
        const user_id = req.params.id;

        const products: Product[] = await prisma.product.findMany({
            where: {
                userId: user_id,
            }
        })

        if (!products || products.length === 0) {
            return res.status(404).json({ message: "No products were found" });
        }

        let listings: { product: Product, images: string[] }[] = [];

        for (const product of products) {
            const [files] = await bucket.getFiles({
                prefix: `${product.id}/`,
            });
            const imageURLs = files.map(file => {
                return `https://storage.googleapis.com/${bucket.name}/${file.name}`;
            });
            listings.push({
                product,
                images: imageURLs
            });
        }
            return res.status(201).json(listings);

    } catch (error) {
        return res.status(500).json({
            message: "Failed to get listings"
        })
    }
}

export const delete_listing = async (req: Request, res: Response<ListingResponseBody>) => {
    try {
        const id = req.params.id;

        const product = await prisma.product.findUnique({
            where: {
                id: id,
            }
        })

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const [files] = await bucket.getFiles({
            prefix: `${product.id}/`,
        })

        await Promise.all(files.map(file => file.delete()));

        await prisma.product.delete({ where: { id } });
        return res.json({ success: true });
    } catch (error) {
        return res.status(500).json({ message: "Failed to delete listing" });
    }
}

export const search_listings = async (req: Request, res: Response<Listings | { message: string }>) => {
    try {
        const search = req.query.search as string;
        const category = req.query.category as string;

        if (!search) {
            return res.status(404).json({
                message: "No search found"
            });
        }

        let listings: { product: Product, images: string[] }[] = [];

        const products = await prisma.product.findMany({
            where: {
                ...(search && {
                    name: {
                        contains: search,
                        mode: "insensitive",
                    }
                }),
                ...(category && {
                    topCategory: {
                        contains: category,
                        mode: "insensitive"
                    }
                })
            }
        })

        let publicUrl;

        for (const product of products) {
            const [files] = await bucket.getFiles({
                prefix: `${product.id}/`,
            })
            const firstFile = files[0];
            if (!firstFile) {
                return null;
            }

            let imageURLs = [];
            imageURLs.push(firstFile.publicUrl());

            if (imageURLs.length === 0) {
                return res.status(404).json({ message: "No image found" });
            }

            listings.push({
                product,
                images: imageURLs,
            })
        }

        return res.status(200).json(listings);

    } catch (error) {
        return res.status(500).json({ message: "Server error searching products" });
    }
}