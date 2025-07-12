"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/validator/auth");
const verifyToken_1 = require("../middleware/verifyToken");
const uploader_1 = require("../middleware/uploader");
const auth_controller_1 = __importDefault(require("../controllers/auth.controller"));
class AuthAccountRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.accountController = new auth_controller_1.default();
        this.initialRoutes();
    }
    initialRoutes() {
        this.router.post("/regis", auth_1.regisValidation, this.accountController.register);
        this.router.post("/login", auth_1.loginValidation, this.accountController.login);
        this.router.get("/verify", this.accountController.verifyAccount);
        this.router.post("/switch-role", verifyToken_1.verifyToken, this.accountController.switchRole);
        this.router.patch("/profile-img/", (0, uploader_1.uploadMemory)().single("img"), verifyToken_1.verifyToken, this.accountController.uploadProfile);
        this.router.patch("/update", verifyToken_1.verifyToken, this.accountController.editProfile);
        this.router.post("/reset-password-request", this.accountController.requestResetPassword);
        this.router.post("/reset-password/", this.accountController.confirmResetPassword);
    }
    getRouter() {
        return this.router;
    }
}
exports.default = AuthAccountRouter;
