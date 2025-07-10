"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AppError {
    constructor(message, statusCode) {
        this.statusCode = statusCode;
        this.success = false;
        this.message = message;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
exports.default = AppError;
