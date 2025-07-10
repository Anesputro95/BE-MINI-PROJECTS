"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const winston_1 = require("winston");
const logFormat = winston_1.format.printf(({ timestamp, level, message }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});
const logger = (0, winston_1.createLogger)({
    level: 'info',
    format: winston_1.format.combine(winston_1.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }), winston_1.format.errors({ stack: true }), winston_1.format.splat(), winston_1.format.json(), logFormat),
    transports: [
        new winston_1.transports.File({
            filename: path_1.default.join(__dirname, '../../logs/error.log'),
            level: 'error',
        }),
        new winston_1.transports.File({
            filename: path_1.default.join(__dirname, '../../logs/combine.log'),
        })
    ]
});
exports.default = logger;
