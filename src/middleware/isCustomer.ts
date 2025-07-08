import { Request, Response, NextFunction } from "express"

export const isCustomer = (req: Request, res: Response, next: NextFunction): void => {
    const user = res.locals.descript;

    if (!user || user.role !== "CUSTOMER") {
        res.status(403).send({
            success: false,
            message: "Access denied: Organizer only."
        });
        return;
    }

    next();
}

