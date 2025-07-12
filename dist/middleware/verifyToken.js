"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const jsonwebtoken_1 = require("jsonwebtoken");
const verifyToken = (req, res, next) => {
    var _a;
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new AppError_1.default("Authorization header missing or invalid", 401);
        }
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        console.log("TOKEN:", token);
        console.log("SECRET:", process.env.TOKEN_KEY);
        logger_1.default.info("Token:", token);
        if (!token) {
            throw new AppError_1.default("Token is missing", 404);
        }
        const checkToken = (0, jsonwebtoken_1.verify)(token, process.env.TOKEN_KEY || "fallback_secret");
        console.log(checkToken);
        // jika token tidak valid, akan di lempar error
        res.locals.descript = checkToken;
        next();
    }
    catch (error) {
        if (error instanceof AppError_1.default) {
            next(error);
        }
        else {
            res.status(500).send(error);
        }
    }
};
exports.verifyToken = verifyToken;
