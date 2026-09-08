import prisma from "../config/dbClient";
import { bucket } from "../googleCloud";
import { v4 as uuidv4 } from "uuid";
import {ProductAndSellerResponseBody} from "../types/interfaces";

export async function createAListing (name: string, description: string, condition: string, price: number, userId: string, topCategory: string, topCategoryId: string, subCategory: string, subCategoryId: string, availability: boolean, location: string, lowestCategory?: string, lowestCategoryId?: string) {
    try {
        if (!condition ||
            !name ||
            !description ||
            !topCategoryId ||
            !price ||
            !userId ||
            !topCategory ||
            !subCategory ||
            !subCategoryId ||
            !availability ||
            !location) {
            return;
        }

        const product = await prisma.product.create({
            data: {
                name,
                condition,
                description,
                topCategory,
                topCategoryId,
                price: Number(price),
                subCategoryId,
                subCategory,
                location,
                availability,
                user: {
                    connect: { id: userId }
                }
            }
        })

        return product;
    } catch (error) {
        console.log(error);
    }
}

export async function fetchAListing (id: string) {
    try {
        if (!id) {

        }

        const foundListing = await prisma.product.findUnique({
            where: {
                id: id,
            },
            include: {
                user: true,
            }
        })

        let final_user: ProductAndSellerResponseBody;

        if (!foundListing) {
            return { message: "Product not found",
                success: false,};
        }

        const [files] = await bucket.getFiles({
            prefix: `${id}/`,
        })

        if (files.length < 1 || undefined || !files) {
            return {
                message: "There are no uploaded files",
                success: false,
            }
        }

        const imageUrls = files.map(file => {
            return file.publicUrl();
        });

        final_user = {
            id: foundListing.id,
            name: foundListing.name,
            description: foundListing.description,
            condition: foundListing.condition,
            price: foundListing.price,
            availability: foundListing.availability,
            topCategoryId: foundListing.topCategoryId,
            topCategory: foundListing.topCategory,
            subCategoryId: foundListing.subCategoryId,
            subCategory: foundListing.subCategory,
            lowestCategoryId: foundListing.lowestCategoryId,
            lowestCategory: foundListing.lowestCategory,
            location: foundListing.location,
            sellerName: foundListing.user.username,
            sellerId: foundListing.user.id,
            sellerPhoneNumber: foundListing.user.phoneNumber ? foundListing.user.phoneNumber : "",
            message: "Successfully fetched product and seller data",
            images: imageUrls,
            success: true,
        }

        return final_user;
    } catch (error) {
        console.log(error);
    }
}