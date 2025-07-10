"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../errors/AppError"));
const jsonwebtoken_1 = require("jsonwebtoken");
const auth_service_1 = require("../services/auth.service");
class AuthAccountController {
    register(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, auth_service_1.regisService)(req.body);
                res.status(201).json({
                    success: true,
                    message: "Account created successfully. Please verify your email.",
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    login(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const loginAccount = yield (0, auth_service_1.loginService)(req.body);
                res.status(200).send({
                    message: "Login Success",
                    email: loginAccount.account.email,
                    imgProfile: loginAccount.account.ImgProfile,
                    role: loginAccount.account.role,
                    referral_code: loginAccount.account.referall_code,
                    token: loginAccount.token,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    verifyAccount(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const authHeader = req.headers.authorization;
                if (!authHeader || !authHeader.startsWith("Bearer ")) {
                    throw new AppError_1.default("Authorization token is missing or invalid", 401);
                }
                const token = authHeader.split(" ")[1];
                if (!token) {
                    throw new AppError_1.default("Token is Missing", 404);
                }
                yield (0, auth_service_1.verifyEmailService)(token);
                res.status(200).json({
                    success: true,
                    message: "Email verified successfully",
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    uploadProfile(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const uploadedUrl = yield (0, auth_service_1.uploadProfileService)(req.file, res.locals.descript.id);
                console.log(uploadedUrl);
                res.status(201).send({
                    success: true,
                    message: "Upload profile success",
                    data: {
                        imageUrl: uploadedUrl
                    }
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    editProfile(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updated = yield (0, auth_service_1.editProfileService)(req.body, res.locals.descript.id);
                res.status(200).send({
                    success: true,
                    message: "account berhasil di update",
                    data: updated,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    requestResetPassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                if (!email) {
                    throw new AppError_1.default("Email is required", 400);
                }
                yield (0, auth_service_1.resetPasswordRequestService)(email);
                res.status(200).json({
                    success: true,
                    message: "Reset password link sent to email.",
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    confirmResetPassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { token, newPassword } = req.body;
                yield (0, auth_service_1.resetPasswordService)(token, newPassword);
                res.status(200).send({
                    success: true,
                    message: "Password changed successfully",
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    switchRole(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedUser = yield (0, auth_service_1.switchRoleService)(res.locals.descript.id);
                // ⬅️ Buat token baru setelah update role
                const token = (0, jsonwebtoken_1.sign)({
                    id: updatedUser.id,
                    email: updatedUser.email,
                    role: updatedUser.role,
                }, process.env.TOKEN_KEY, // pastikan TOKEN_KEY tersedia di .env
                { expiresIn: "1d" });
                res.status(200).json({
                    success: true,
                    message: "Role switched successfully",
                    role: updatedUser.role,
                    token, // ⬅️ kirim token baru ke FE
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = AuthAccountController;
