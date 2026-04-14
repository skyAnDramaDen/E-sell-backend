import {sign, SignOptions} from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "sndiuweh87r3wdbrn837gcr388ZFWR@@!sdfbsdfdD";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";

if (!JWT_EXPIRES_IN || !JWT_SECRET) {
    throw new Error("JWT_EXPIRES_IN or JWT secret not available");
}

export const generateToken = (user_id: string): string => {
    const payload: { id: string } = { id: user_id };
    const options: SignOptions = { expiresIn: JWT_EXPIRES_IN as any };

    return sign(payload, JWT_SECRET as string, options);
}