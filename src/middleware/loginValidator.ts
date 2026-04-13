import { Request, Response, NextFunction } from 'express';


export const loginValidator = (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "User email or password is missing from login validator",
                success: false,
            })
        }

        next();
    } catch (error) {
        return res.status(500).json({
            message: "There has been a server error",
            success: false,
        })
    }
}