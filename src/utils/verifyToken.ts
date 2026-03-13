import jwt from 'jsonwebtoken';

export function verifyToken(token: string, secret: string) {
    try {
        return jwt.verify(token, secret);
    } catch {
        return null;
    }
}