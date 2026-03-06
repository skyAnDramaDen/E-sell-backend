jest.mock("../../src/utils/generateToken", () => ({
    __esModule: true,
    generateToken: jest.fn(() => "mocked-token"),
}));

jest.mock("../../src/config/dbClient", () => ({
    __esModule: true,
    default: {
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
        },
    },
}));

jest.mock("argon2", () => ({
    __esModule: true,
    hash: jest.fn(),
    verify: jest.fn(),
}));

import { login_user, register_user } from "../../src/controllers/authController";
import prisma from "../../src/config/dbClient";
import { hash, verify } from "argon2";
import {generateToken} from "../../src/utils/generateToken";


describe("login_user controller", () => {
    const mockResponse = () => {
        const res: any = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        return res;
    };

    it("returns 400 if email or password is missing", async () => {
        const req: any = { body: {} };
        const res = mockResponse();

        await login_user(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "User email or password is missing",
            success: false,
        });
    });

    it("returns 400 if user is not found", async () => {
        const req: any = { body: { email: "test@test.com", password: "1234" } };
        const res = mockResponse();
        // You cast the function to a Jest mock type so TypeScript allows mock methods.
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

        await login_user(req, res);

        expect(prisma.user.findUnique).toHaveBeenCalledWith({
            where: { email: "test@test.com" },
        });

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "User not found!",
            success: false,
        });
    });

    it("returns 400 if password is invalid", async () => {
        const req: any = { body: { email: "test@test.com", password: "wrong" } };
        const res = mockResponse();

        (prisma.user.findUnique as jest.Mock).mockResolvedValue({
            id: "1",
            username: "John",
            email: "test@test.com",
            password: "hashedpass",
        });

        (verify as jest.Mock).mockResolvedValue(false);

        await login_user(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Email and password do not match",
            success: false,
        });
    });

    it("returns 201 and token on success", async () => {
        const req: any = { body: { email: "test@test.com", password: "1234" } };
        const res = mockResponse();

        (prisma.user.findUnique as jest.Mock).mockResolvedValue({
            id: "1",
            username: "John",
            email: "test@test.com",
            password: "$argon2id$v=19$m=65536,t=3,p=4$fakehash",
            phoneNumber: "1234567890",
        });

        (verify as jest.Mock).mockResolvedValue(true);

        await login_user(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            token: expect.any(String),
            message: "User has been logged in successfully",
            user: {
                id: "1",
                username: "John",
                email: "test@test.com",
                phoneNumber: "1234567890",
            },
            success: true,
        });
    });
});


describe("register_user controller", () => {
    const mockResponse = () => {
        const res: any = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        return res;
    };

    it("returns 400 if email, name, or password is missing", async () => {
        const req: any = { body: {} };
        const res = mockResponse();

        await register_user(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Name, email or password missing",
            success: false,
        });
    });

    it("returns 400 if user with that email was found", async () => {
        const req: any = { body: { email: "test@test.com", password: "1234", username: "Perry" } };
        const res = mockResponse();

        (prisma.user.findUnique as jest.Mock).mockResolvedValue({
            id: "1",
            name: "Perry",
            email: "test@test.com",
            password: "$argon2id$v=19$m=65536,t=3,p=4$fakehash",
            phoneNumber: "1234567890",
        });

        await register_user(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "A user with that email already exists",
            success: false,
        });
    })

    it("returns 400 if there is no created new user", async () => {
        const req: any = { body: { email: "test@test.com", password: "1234", username: "Perry", } };
        const res = mockResponse();

        (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

        (hash as jest.Mock).mockResolvedValue(true);

        (prisma.user.create as jest.Mock).mockRejectedValue((new Error("DB error")));

        await register_user(req, res);

        expect(res.status).toHaveBeenCalledWith(501);
        expect(res.json).toHaveBeenCalledWith({
            message: "An unexpected error occurred. Please try again later", success: false,
        });
    })

    it("returns success and 201 if all goes well", async () => {
        const res: any = mockResponse();
        const req: any = { body: { email: "test@test.com", password: "1234", username: "Perry", } };

        (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
        (prisma.user.create as jest.Mock).mockResolvedValue({
            id: "1",
            username: "Perry",
            email: "test@test.com",
            phoneNumber: "1234567890",
        });

        (hash as jest.Mock).mockResolvedValue(true);
        (generateToken as jest.Mock).mockResolvedValue("sbrcg43jrgd763gSFESFW#$342rcnu4")

        await register_user(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            // token: expect.any(String),
            message: "User has been created successfully",
            user: {
                id: "1",
                username: "Perry",
                email: "test@test.com",
                phoneNumber: "1234567890",
            },
            token: expect.any(String),
            success: true,
        });
    })
})