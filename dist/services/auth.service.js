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
exports.switchRoleService = exports.resetPasswordService = exports.resetPasswordRequestService = exports.editProfileService = exports.uploadProfileService = exports.verifyEmailService = exports.loginService = exports.regisService = void 0;
const bcrypt_1 = require("bcrypt");
const nodemailer_1 = require("../config/nodemailer");
const AppError_1 = __importDefault(require("../errors/AppError"));
const account_repositori_1 = require("../repositories/account.repositori");
const hash_1 = require("../utils/hash");
const jsonwebtoken_1 = require("jsonwebtoken");
const crypto_1 = __importDefault(require("crypto"));
const bcrypt_2 = __importDefault(require("bcrypt"));
const referral_repositori_1 = require("../repositories/referral.repositori");
const userPoints_repositori_1 = require("../repositories/userPoints.repositori");
const coupon_repositori_1 = require("../repositories/coupon.repositori");
const cloudinary_1 = require("../config/cloudinary");
const regisService = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password, role } = data;
    const exitingAccount = yield (0, account_repositori_1.findAccountByEmail)(email);
    if (exitingAccount) {
        throw new AppError_1.default("User already exist", 400);
    }
    let referredBy = null;
    const referralCode = data.referralCode;
    let referrer = null;
    if (referralCode) {
        referrer = yield (0, account_repositori_1.findAccountByReferralCode)(referralCode);
        if (!referrer) {
            throw new AppError_1.default("Invalid referral code", 400);
        }
        referredBy = referralCode;
    }
    let referralCodeNew = "";
    let isUnique = false;
    while (!isUnique) {
        const code = `${username}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const existingCode = yield (0, account_repositori_1.findAccountByReferralCode)(code);
        if (!existingCode) {
            referralCodeNew = code;
            isUnique = true;
        }
    }
    const safeRoles = "CUSTOMER";
    const newAccount = yield (0, account_repositori_1.createAccountByEmail)({
        username,
        email,
        password: yield (0, hash_1.hashPassword)(password),
        role: safeRoles,
        isVerified: false,
        referall_code: referralCodeNew,
        referred_by: referredBy
    });
    if (referralCode && referrer) {
        // point expires selama 3 bulan
        const now = new Date();
        const pointExpire = new Date(now);
        pointExpire.setMonth(now.getMonth() + 3);
        // tambah ke tabel referall
        yield (0, referral_repositori_1.createReferral)(referrer.id, newAccount.id);
        // tamabah 10.000 point ke referrer
        yield (0, userPoints_repositori_1.createUserPoints)({
            userId: referrer.id,
            amount: 10000,
            expiredAt: pointExpire,
        });
        // tambah coupon ke newaccount 
        const couponCode = `Coupon-${newAccount.id}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        yield (0, coupon_repositori_1.createCoupon)({
            userId: newAccount.id,
            code: couponCode,
            discount: 10,
            expiresAt: pointExpire,
        });
    }
    const token = crypto_1.default.randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 jam
    yield (0, account_repositori_1.createVerificationToken)(newAccount.id, token, expiresAt);
    const verifyLink = `http://localhost:3000/verify-account/${token}`;
    console.log("📧 Verification link sent:", verifyLink);
    console.log("📧 Verification link sent:", verifyLink); // ⬅️ Tambahkan ini
    yield nodemailer_1.transport.sendMail({
        from: process.env.MAILSENDER,
        to: newAccount.email,
        subject: "Verify Your Account - Event App",
        html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              .container {
                max-width: 600px;
                margin: auto;
                font-family: Arial, sans-serif;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                padding: 24px;
                background-color: #f9f9f9;
              }
              .btn {
                display: inline-block;
                margin-top: 20px;
                padding: 12px 24px;
                background-color: #007bff;
                color: white;
                text-decoration: none;
                border-radius: 4px;
              }
              .footer {
                font-size: 12px;
                color: #888;
                margin-top: 30px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h2 style="color:#333;">Welcome to Event App, ${newAccount.username}!</h2>
              <p>Thank you for registering your account.</p>
              <p>To complete your registration, please verify your email by clicking the button below:</p>
      
              <a href="${verifyLink}" class="btn">Verify My Account</a>
      
              <p>If the button above doesn't work, copy and paste the following link into your browser:</p>
              <a href="${verifyLink}" class="">click here</a>
              
      
              <div class="footer">
                <p>This email was sent by Event App. If you did not sign up, please ignore this message.</p>
              </div>
            </div>
          </body>
        </html>
        `,
    });
    return newAccount;
});
exports.regisService = regisService;
const loginService = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = data;
    const findUser = yield (0, account_repositori_1.loginAccountByEmail)(email);
    if (!findUser) {
        throw new AppError_1.default("Email not registered", 404);
    }
    ;
    if (!findUser.isVerified) {
        throw new AppError_1.default("Email not verify, please verify first", 401);
    }
    const comparePass = yield (0, bcrypt_1.compare)(data.password, findUser.password);
    if (!comparePass) {
        throw new AppError_1.default("Password is wrong", 401);
    }
    const token = (0, jsonwebtoken_1.sign)({ id: findUser.id, role: findUser.role }, process.env.TOKEN_KEY || "fallback_secret", { expiresIn: "1d" });
    return {
        token,
        account: findUser
    };
});
exports.loginService = loginService;
const verifyEmailService = (token) => __awaiter(void 0, void 0, void 0, function* () {
    const record = yield (0, account_repositori_1.findVerificationToken)(token);
    if (!record)
        throw new AppError_1.default("Invalid or expired token", 404);
    if (record.expiresAt < new Date()) {
        yield (0, account_repositori_1.deleteVerificationToken)(token);
        throw new AppError_1.default("Token has expired", 400);
    }
    yield (0, account_repositori_1.verifyAccountByEmail)(record.account.email);
    yield (0, account_repositori_1.deleteVerificationToken)(token);
});
exports.verifyEmailService = verifyEmailService;
const uploadProfileService = (file, id) => __awaiter(void 0, void 0, void 0, function* () {
    if (!file) {
        throw new AppError_1.default("No file exist", 400);
    }
    console.log("FILE YANG DIKIRIM:", file);
    const upload = yield (0, cloudinary_1.cloudinaryUpload)(file);
    yield (0, account_repositori_1.updateUser)({ ImgProfile: upload.secure_url }, id);
    return upload.secure_url;
});
exports.uploadProfileService = uploadProfileService;
const editProfileService = (data, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const account = yield (0, account_repositori_1.findAccountById)(userId);
    if (!account) {
        throw new AppError_1.default("User not found", 404);
    }
    if (!data.oldpassword || !data.newPassword) {
        throw new AppError_1.default("Old and new passwords must be filled in.", 400);
    }
    const isMatch = yield bcrypt_2.default.compare(data.oldpassword, account.password);
    if (!isMatch) {
        throw new AppError_1.default("Password is not correct", 404);
    }
    ;
    const hashedNewPassword = yield bcrypt_2.default.hash(data.newPassword, 10);
    const updatedUser = yield (0, account_repositori_1.updateUser)({
        username: data.username || account.username,
        password: hashedNewPassword
    }, userId);
    return updatedUser;
});
exports.editProfileService = editProfileService;
const resetPasswordRequestService = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const account = yield (0, account_repositori_1.findAccountByEmail)(email);
    if (!account) {
        return;
    }
    ;
    const token = crypto_1.default.randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 menit
    const tokenData = yield (0, account_repositori_1.findResetToken)(token);
    yield (0, account_repositori_1.deleteAllResetTokensByEmail)(email);
    yield (0, account_repositori_1.createPasswordResetToken)(email, token, expiresAt);
    const resetLink = `http://localhost:3000/reset-password/${token}`;
    yield nodemailer_1.transport.sendMail({
        to: email,
        subject: "Reset Password",
        html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              .container {
                max-width: 600px;
                margin: auto;
                font-family: Arial, sans-serif;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                padding: 24px;
                background-color: #f9f9f9;
              }
              .btn {
                display: inline-block;
                margin-top: 20px;
                padding: 12px 24px;
                background-color: #dc3545;
                color: white;
                text-decoration: none;
                border-radius: 4px;
              }
              .footer {
                font-size: 12px;
                color: #888;
                margin-top: 30px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <p>You have requested to reset your password.</p>
              <p>Click the button below to create a new password:</p>

              <a href="${resetLink}" class="btn">Reset My Password</a>
              <br>
              <p>If the button above doesn't work, copy and paste the following link into your browser:</p>

              <div class="footer">
                <p>This email was sent by Event App. If you did not request a password reset, please ignore this message or contact support.</p>
              </div>
              <p>This link is valid for 30 minutes only.</p>

            </div>
          </body>
        </html>
        `
    });
    return token;
});
exports.resetPasswordRequestService = resetPasswordRequestService;
const resetPasswordService = (token, newPassword) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Token received:", token);
    const tokenData = yield (0, account_repositori_1.findResetToken)(token);
    console.log("Token from DB:", tokenData);
    if (!tokenData || tokenData.expiresAt < new Date()) {
        throw new AppError_1.default("Token invalid", 400);
    }
    ;
    const account = yield (0, account_repositori_1.findAccountByEmail)(tokenData.email);
    if (!account) {
        throw new AppError_1.default("User not exist", 404);
    }
    const hashPassword = yield bcrypt_2.default.hash(newPassword, 10);
    yield (0, account_repositori_1.updateUser)({ password: hashPassword }, account.id);
    yield (0, account_repositori_1.deleteResetToken)(token);
});
exports.resetPasswordService = resetPasswordService;
const switchRoleService = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield account_repositori_1.accountSwitch.findById(userId);
    if (!user)
        throw new AppError_1.default("User not found", 404);
    const newRole = user.role === "CUSTOMER" ? "ORGANIZER" : "CUSTOMER";
    const updatedUser = yield account_repositori_1.accountSwitch.updateRole(userId, newRole);
    return updatedUser;
});
exports.switchRoleService = switchRoleService;
