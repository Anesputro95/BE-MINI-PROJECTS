import { NextFunction, Request, Response } from "express";
import logger from "../utils/logger";
import AppError from "../errors/AppError";
import { JwtPayload, verify } from "jsonwebtoken"

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new AppError("Authorization header missing or invalid", 401);
        }

        const token = req.headers.authorization?.split(" ")[1];
        console.log("TOKEN:", token);
        console.log("SECRET:", process.env.TOKEN_KEY);

        logger.info("Token:", token);

        if (!token) {
            throw new AppError("Token is missing", 404);
        }

        const checkToken = verify(token, process.env.TOKEN_KEY || "fallback_secret")
        console.log("Decoded token:", checkToken);

        // jika token tidak valid, akan di lempar error
        res.locals.descript = checkToken as JwtPayload;
        next();

    } catch (error: any) {
        if (error instanceof AppError) {
            next(error)
        } else {
            res.status(500).send(error)
        }
    }
}