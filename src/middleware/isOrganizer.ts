import { NextFunction, Request, Response } from "express";

export const isOrganizer = async (req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.descript

    if (!user || user.role !== "ORGANIZER") {
        return res.status(404).send({
            succes: false,
            message: "Access denied: Organizer only."
        })
    }
}