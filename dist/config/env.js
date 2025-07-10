"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOKEN_KEY = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.TOKEN_KEY = process.env.TOKEN_KEY;
if (!exports.TOKEN_KEY) {
    throw new Error("TOKEN_KEY is not defined in .env");
}
