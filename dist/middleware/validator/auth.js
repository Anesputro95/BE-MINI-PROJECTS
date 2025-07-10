"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginValidation = exports.regisValidation = void 0;
const express_validator_1 = require("express-validator");
const validationHandling = (req, res, next) => {
    try {
        const errorValidation = (0, express_validator_1.validationResult)(req);
        if (!errorValidation.isEmpty()) {
            throw { rc: 400, error: errorValidation.array() };
        }
        next();
    }
    catch (error) {
        res.status(error.rc).send(error);
    }
};
exports.regisValidation = [
    (0, express_validator_1.body)("username").notEmpty().withMessage("Username is required"),
    (0, express_validator_1.body)("email").notEmpty().isEmail().withMessage("Email is required"),
    (0, express_validator_1.body)("password").notEmpty().isStrongPassword({
        minLength: 6,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 0,
    }).withMessage("Min. password 6 characters, min 1 huruf kecil, 1 huruf besar, dan 1 angka"),
    (0, express_validator_1.body)("role").optional(),
    validationHandling,
];
exports.loginValidation = [
    (0, express_validator_1.body)("email").notEmpty().withMessage("Email is required"),
    (0, express_validator_1.body)("password").notEmpty().isStrongPassword({
        minLength: 6,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 0,
    }).withMessage("Min. password 6 characters, min 1 huruf kecil, 1 huruf besar, dan 1 angka"),
    validationHandling,
];
