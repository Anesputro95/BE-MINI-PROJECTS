"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isOrganizer = void 0;
const isOrganizer = (req, res, next) => {
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
exports.isOrganizer = isOrganizer;
