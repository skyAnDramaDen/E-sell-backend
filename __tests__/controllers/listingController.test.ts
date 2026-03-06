jest.mock("../../src/config/dbClient", () => ({
    __esModule: true,
    default: {
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
        },
        product: {
            findUnique: jest.fn(),
            create: jest.fn(),
            findMany: jest.fn(),
        },
    },
}))

jest.mock("uuid", () => ({
    v4: () => "mocked-value",
}))

jest.mock("../../src/googleCloud", () => ({
    bucket: {
        getFiles: jest.fn(),
        file: jest.fn(() => ({
            delete: jest.fn(),
        })),
    },
}))

import { create_listing, get_listing, get_all_listings, delete_listing, search_listings } from "../../src/controllers/listingController";
import prisma from "../../src/config/dbClient";

import { bucket } from "../../src/googleCloud";

const mockResponse = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

describe("create_listing controller", () => {
    const mockFiles = [
        {
            originalname: "image1.jpg",
            mimetype: "image/jpeg",
            buffer: Buffer.from("fake-image-data"),
            size: 1234,
        },
    ] as Express.Multer.File[];


    it("returns 400 if the request body is missing", async () => {
        const req: any = {
            body: {

            }
        }

        const res = mockResponse();

        await create_listing(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Request body is empty!",
            success: false,
        })
    })

    it("returns 400 if the product is not created", async () => {
        const req: any = {
            body: {
                name: "Wireless Headphones",
                description: "High‑quality Bluetooth headphones with noise cancellation.",
                condition: "New",
                price: 79,
                userId: "1",
                lowestCategory: "Audio Accessories",
                subCategory: "Headphones",
                topCategory: "Electronics",
                lowestCategoryId: "cat_low_1",
                subCategoryId: "cat_sub_1",
                topCategoryId: "cat_top_1",
                location: "Leeds",
                user: {
                    id: "1",
                    username: "Perry",
                    email: "test@test.com",
                    phoneNumber: "1234567890",
                },
            }
        }

        const res = mockResponse();

        (prisma.product.create as jest.Mock).mockRejectedValue((new Error("DB error")));

        await create_listing(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: "There was a server error",
            success: false,
        })
    })

    it("returns 400 if there are no image files", async () => {
        const req: any = {
            files: [],
            body: {
                name: "Wireless Headphones",
                description: "High‑quality Bluetooth headphones with noise cancellation.",
                condition: "New",
                price: 79,
                userId: "1",
                lowestCategory: "Audio Accessories",
                subCategory: "Headphones",
                topCategory: "Electronics",
                lowestCategoryId: "cat_low_1",
                subCategoryId: "cat_sub_1",
                topCategoryId: "cat_top_1",
                location: "Leeds",
                user: {
                    id: "1",
                    username: "Perry",
                    email: "test@test.com",
                    phoneNumber: "1234567890",
                },
            },
        }

        const res: any = mockResponse();

        (prisma.product.create as jest.Mock).mockResolvedValue(true);

        await create_listing(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "No files uploaded",
            success: false
        })
    })

    // it("returns 201 if all was successful", async () => {
    //     const req: any = {
    //         files: mockFiles,
    //         body: {
    //             name: "Wireless Headphones",
    //             description: "High‑quality Bluetooth headphones with noise cancellation.",
    //             condition: "New",
    //             price: 79,
    //             userId: "1",
    //             lowestCategory: "Audio Accessories",
    //             subCategory: "Headphones",
    //             topCategory: "Electronics",
    //             lowestCategoryId: "cat_low_1",
    //             subCategoryId: "cat_sub_1",
    //             topCategoryId: "cat_top_1",
    //             location: "Leeds",
    //             user: {
    //                 id: "1",
    //                 username: "Perry",
    //                 email: "test@test.com",
    //                 phoneNumber: "1234567890",
    //             },
    //         },
    //     }
    //
    //     const res: any = mockResponse();
    //
    //     (prisma.product.create as jest.Mock).mockResolvedValue({
    //         id: "8f3c2b4e-9a12-4d7c-8e91-3c1f7a2b5d10",
    //         name: "Wireless Headphones",
    //         description: "High‑quality Bluetooth headphones with noise cancellation.",
    //         condition: "New",
    //         price: 79,
    //         createdAt: "2026-03-05T20:38:00.000Z",
    //         updatedAt: "2026-03-05T20:38:00.000Z",
    //         userId: "1",
    //
    //         lowestCategory: "Audio Accessories",
    //         subCategory: "Headphones",
    //         topCategory: "Electronics",
    //
    //         availability: true,
    //
    //         lowestCategoryId: "cat_low_1",
    //         subCategoryId: "cat_sub_1",
    //         topCategoryId: "cat_top_1",
    //
    //         location: "Leeds",
    //
    //         user: {
    //             id: "1",
    //             username: "Perry",
    //             email: "test@test.com",
    //             phoneNumber: "1234567890",
    //         },
    //     });
    //
    //     await create_listing(req, res);
    //
    //     expect(res.status).toHaveBeenCalledWith(201);
    //     expect(res.json).toHaveBeenCalledWith({
    //         product: {
    //             id: "8f3c2b4e-9a12-4d7c-8e91-3c1f7a2b5d10",
    //             name: "Wireless Headphones",
    //             description: "High‑quality Bluetooth headphones with noise cancellation.",
    //             condition: "New",
    //             price: 79,
    //             createdAt: "2026-03-05T20:38:00.000Z",
    //             updatedAt: "2026-03-05T20:38:00.000Z",
    //             userId: "1",
    //
    //             lowestCategory: "Audio Accessories",
    //             subCategory: "Headphones",
    //             topCategory: "Electronics",
    //
    //             availability: true,
    //
    //             lowestCategoryId: "cat_low_1",
    //             subCategoryId: "cat_sub_1",
    //             topCategoryId: "cat_top_1",
    //
    //             location: "Leeds",
    //
    //             user: {
    //                 id: "1",
    //                 username: "Perry",
    //                 email: "test@test.com",
    //                 phoneNumber: "1234567890",
    //             },
    //         },
    //         message: "The listing was created successfully"
    //     })
    // })
})


describe("get_listing controller", () => {
    const mockBucketFiles = [
        { name: "image1.jpg" },
        { name: "image2.jpg" }
    ];

    it("returns 200 if the request body has no id value", async () => {
        const res: any = mockResponse();

        const req: any = {
            body: {
                id: null,
            }
        }

        await get_listing(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "There is no product id.",
            success: false,
        })
    })

    it("returns 404 if the product was not found", async () => {
        const req: any = {
            body: {
                id: "1",
            }
        }
        const res: any = mockResponse();

        (prisma.product.findUnique as jest.Mock).mockResolvedValue(false);

        await get_listing(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            message: "Product not found",
            success: false,
        })
    })

    it("returns 404 if there are no files available", async () => {
        const req: any = {
            body: {
                id: "1",
            }
        }
        const res: any = mockResponse();

        (prisma.product.findUnique as jest.Mock).mockResolvedValue(true);
        (bucket.getFiles as jest.Mock).mockResolvedValue([[]]);

        await get_listing(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "There are no uploaded files",
            success: false,
        })
    })

    it("returns 201 if everything is successful", async () => {
        const req: any = {
            body: {
                id: "1",
            }
        }
        const res: any = mockResponse();

        (prisma.product.findUnique as jest.Mock).mockResolvedValue({
            id: "prod_123",
            name: "Wireless Headphones",
            description: "High‑quality Bluetooth headphones with noise cancellation.",
            condition: "New",
            price: 79,
            availability: true,
            topCategoryId: "cat_top_1",
            topCategory: "Electronics",
            subCategoryId: "cat_sub_1",
            subCategory: "Headphones",
            lowestCategoryId: "cat_low_1",
            lowestCategory: "Audio Accessories",
            location: "Leeds",
            user: {
                id: "1",
                username: "Perry",
                email: "test@test.com",
                phoneNumber: "1234567890"
            }
        });


        (bucket.getFiles as jest.Mock).mockResolvedValue([
            [
                {
                    name: "image1.jpg",
                    publicUrl: () => "https://storage.googleapis.com/mock-bucket/prod_123/image1.jpg"
                },
                {
                    name: "image2.jpg",
                    publicUrl: () => "https://storage.googleapis.com/mock-bucket/prod_123/image2.jpg"
                }
            ]
        ]);

        await get_listing(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            id: "prod_123",
            name: "Wireless Headphones",
            description: "High‑quality Bluetooth headphones with noise cancellation.",
            condition: "New",
            price: 79,
            availability: true,
            topCategoryId: "cat_top_1",
            topCategory: "Electronics",
            subCategoryId: "cat_sub_1",
            subCategory: "Headphones",
            lowestCategoryId: "cat_low_1",
            lowestCategory: "Audio Accessories",
            location: "Leeds",
            sellerName: "Perry",
            sellerPhoneNumber: "1234567890",
            message: "Successfully fetching product and seller data",
            images: [
                "https://storage.googleapis.com/mock-bucket/prod_123/image1.jpg",
                "https://storage.googleapis.com/mock-bucket/prod_123/image2.jpg",
            ],
            success: true
        })
    })
})


describe("get_all_listings controller", () => {
    it("returns 400 if there is no user id", async () => {
        const req: any = {
            body: {

            }
        }

        const res: any = mockResponse();

        await get_all_listings(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "There is no user id",
            success: false,
        })
    })
})