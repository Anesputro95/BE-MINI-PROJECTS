import { NextFunction, Request, Response } from "express";
import logger from "../utils/logger";
import AppError from "../errors/AppError";
import { verify } from "jsonwebtoken"

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        logger.info("Token:", token);

        if (!token) {
            throw new AppError("Token is missing", 404);
        }

        const checkToken = verify(token, process.env.TOKEN_KEY || "secret")
        console.log(checkToken);

        // jika token tidak valid, akan di lempar error
        res.locals.user = checkToken;
        next();

    } catch (error: any) {
        if (error instanceof AppError) {
            next(error)
        }else {
            res.status(500).send(error)
        }
    }
}