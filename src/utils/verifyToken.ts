import jwt from 'jsonwebtoken';

export function verifyToken(token: string) {
    try {
        return jwt.verify(token, "secret");
    } catch {
        return null;
    }
}