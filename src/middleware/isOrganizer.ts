import { NextFunction, Request, Response } from "express";

export const isOrganizer = (req: Request, res: Response, next: NextFunction): void => {
    const user = res.locals.descript;
    console.log("User from JWT:", user);

    if (!user || user.role !== "ORGANIZER") {
        res.status(403).send({
            success: false,
            message: "Access denied: Organizer only."
        });
        return;
    }

    next();
};
