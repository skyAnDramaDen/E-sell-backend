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
    ProductAndSellerResponseBody,
    MessageAndSuccessResponseBody
} from "../types/interfaces.js";

export const create_listing = async (req: Request, res: Response<ListingResponseBody | MessageAndSuccessResponseBody>) => {
    try {
        req.body.price = Number(req.body.price);

        const product = await prisma.product.create({
            data: req.body,
        })

        const files = req.files as Express.Multer.File[];

        if (!files || files.length === 0) {
            return res.status(400).json({ message: "No files uploaded",
            success: false });
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
                return res.status(500).json({ message: "Error accessing GCS bucket",
                success: false });
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
                return res.status(500).json({ message: "Error uploading file",
                success: false });
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
            message: "There was a server error",
            success: false,
        })
    }
}

export const get_listing = async (req: Request, res: Response<ProductAndSellerResponseBody | MessageAndSuccessResponseBody>) => {
    try {
        const product_id = req.params.id;

        const product = await prisma.product.findUnique({
            where: {
                id: product_id,
            },
            include: {
                user: true,
            }
        })

        let final_user: ProductAndSellerResponseBody;

        if (!product) {
            return res.status(404).json({ message: "Product not found",
            success: false,});
        }

        const [files] = await bucket.getFiles({
            prefix: `${product_id}/`,
        })

        const imageUrls = files.map(file => file.publicUrl());

        final_user = {
            id: product.id,
            name: product.name,
            description: product.description,
            condition: product.condition,
            price: product.price,
            availability: product.availability,
            topCategoryId: product.topCategoryId,
            topCategory: product.topCategory,
            subCategoryId: product.subCategoryId,
            subCategory: product.subCategory,
            lowestCategoryId: product.lowestCategoryId,
            lowestCategory: product.lowestCategory,
            location: product.location,
            sellerName: product.user.name,
            sellerPhoneNumber: product.user.phoneNumber ? product.user.phoneNumber : "",
            message: "Successfully fetching product and seller data",
            images: imageUrls,
            success: true,
        }

        return res.status(200).json(final_user);
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
            return res.status(404).json({ message: "You currently do not have any listings",
            success: false,
            });
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
            message: "Failed to get listings",
            success: false,
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
        const id = req.query.id as string;

        if (!search && !category) {
            return res.status(404).json({
                message: "Pls include the right params"
            });
        }

        let listings: { product: Product, images: string[] }[] = [];

        const top_category_products = await prisma.product.findMany({
            where: {
                ...(search && {
                    name: {
                        contains: search,
                        mode: "insensitive",
                    }
                }),
                ...(category && {
                    topCategory: {
                        equals: category,
                        mode: "insensitive"
                    }
                }),
                NOT: {
                    userId: id,
                }
            },
            include: {
                user: true,
            }
        })

        const sub_category_products = await prisma.product.findMany({
            where: {
                ...(search && {
                    name: {
                        contains: search,
                        mode: "insensitive",
                    }
                }),
                ...(category && {
                    subCategory: {
                        equals: category,
                        mode: "insensitive"
                    }
                }),
                NOT: {
                    userId: id,
                }
            },
            include: {
                user: true,
            }
        })

        const lowest_category_products = await prisma.product.findMany({
            where: {
                ...(search && {
                    name: {
                        contains: search,
                        mode: "insensitive",
                    }
                }),
                ...(category && {
                    lowestCategory: {
                        equals: category,
                        mode: "insensitive"
                    }
                }),
                NOT: {
                    userId: id,
                }
            },
            include: {
                user: true,
            }
        })

        let publicUrl;

        if (top_category_products.length > 0) {
            for (const product of top_category_products) {
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
        } else if (sub_category_products.length > 0) {
            for (const product of sub_category_products) {
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
        } else if (lowest_category_products.length > 0) {
            for (const product of lowest_category_products) {
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
        }
    } catch (error) {
        return res.status(500).json({ message: "Server error searching products" });
    }
}