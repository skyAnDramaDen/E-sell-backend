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
            delete: jest.fn(),
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
        name: "my-test-bucket",
    },
}))

import { edit_user, get_user, change_user_password } from "../../src/controllers/userController";
import prisma from "../../src/config/dbClient";

import { bucket } from "../../src/googleCloud";

const mockResponse = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

describe("edit_user controller", () => {
    it("returns 400 if there are missing fields",  async () => {
        const req: any = {
            body: {
                email: null,
                name: null
            }
        }
    })
})