import { Request, Response, NextFunction } from "express"

export const isCustomer = (req: Request, res: Response, next: NextFunction): void => {
    const user = res.locals.descript;
    console.log("🔥 [isCustomer] user:", user);

    if (!user) {
        res.status(403).send({
            success: false,
            message: "No user found in token"
        });
        return;
    }

    if (user.role !== "CUSTOMER") {
        res.status(403).send({
            success: false,
            message: `Access denied: Role is ${user.role}, expected CUSTOMER`
        });
        return;
    }

    next();
}
