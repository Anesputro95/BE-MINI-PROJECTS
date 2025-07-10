"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCustomer = void 0;
const isCustomer = (req, res, next) => {
    const user = res.locals.descript;
    if (!user || user.role !== "CUSTOMER") {
        res.status(403).send({
            success: false,
            message: "Access denied: Organizer only."
        });
        return;
    }
    next();
};
exports.isCustomer = isCustomer;
