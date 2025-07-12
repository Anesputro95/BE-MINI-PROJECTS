"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMemory = void 0;
const multer_1 = __importDefault(require("multer"));
const uploadMemory = () => {
    return (0, multer_1.default)({
        storage: multer_1.default.memoryStorage(),
        limits: {
            fileSize: 10 * 1024 * 1024 // 10 MB
        },
        fileFilter: (req, file, callback) => {
            const allowedExt = /\.(jpg|jpeg|png|gif)$/;
            if (!allowedExt.test(file.originalname.toLowerCase())) {
                return callback(new Error("Wrong file extention only (jpeg|jpg|png|gif)"));
            }
            callback(null, true);
        }
    });
};
exports.uploadMemory = uploadMemory;
