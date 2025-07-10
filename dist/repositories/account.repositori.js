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
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountSwitch = exports.deleteAllResetTokensByEmail = exports.deleteResetToken = exports.findResetToken = exports.createPasswordResetToken = exports.updateUser = exports.findAccountById = exports.verifyAccountByEmail = exports.deleteVerificationToken = exports.findVerificationToken = exports.createVerificationToken = exports.loginAccountByEmail = exports.createAccountByEmail = exports.findAccountByReferralCode = exports.findAccountByEmail = void 0;
const prisma_1 = require("../config/prisma");
const findAccountByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.prisma.account.findUnique({
        where: { email }
    });
});
exports.findAccountByEmail = findAccountByEmail;
const findAccountByReferralCode = (code) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.prisma.account.findUnique({
        where: { referall_code: code }
    });
});
exports.findAccountByReferralCode = findAccountByReferralCode;
const createAccountByEmail = (data) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.prisma.account.create({ data });
});
exports.createAccountByEmail = createAccountByEmail;
const loginAccountByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.prisma.account.findUnique({
        where: { email }
    });
});
exports.loginAccountByEmail = loginAccountByEmail;
const createVerificationToken = (accountId, token, expiresAt) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.prisma.emailVerification.create({
        data: {
            accountId,
            token,
            expiresAt,
        }
    });
});
exports.createVerificationToken = createVerificationToken;
const findVerificationToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.prisma.emailVerification.findUnique({
        where: { token },
        include: { account: true }
    });
});
exports.findVerificationToken = findVerificationToken;
const deleteVerificationToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.prisma.emailVerification.delete({
        where: { token },
    });
});
exports.deleteVerificationToken = deleteVerificationToken;
const verifyAccountByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.prisma.account.update({
        where: { email },
        data: {
            isVerified: true,
        }
    });
});
exports.verifyAccountByEmail = verifyAccountByEmail;
const findAccountById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.prisma.account.findUnique({
        where: { id }
    });
});
exports.findAccountById = findAccountById;
const updateUser = (data, id) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.prisma.account.update({
        data,
        where: { id }
    });
});
exports.updateUser = updateUser;
const createPasswordResetToken = (email, token, expiresAt) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.prisma.passwordReset.create({
        data: {
            email,
            token,
            expiresAt
        }
    });
});
exports.createPasswordResetToken = createPasswordResetToken;
const findResetToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.prisma.passwordReset.findUnique({
        where: { token }
    });
});
exports.findResetToken = findResetToken;
const deleteResetToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.prisma.passwordReset.delete({
        where: { token },
    });
});
exports.deleteResetToken = deleteResetToken;
const deleteAllResetTokensByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.prisma.passwordReset.deleteMany({
        where: { email },
    });
});
exports.deleteAllResetTokensByEmail = deleteAllResetTokensByEmail;
exports.accountSwitch = {
    findById: (id) => prisma_1.prisma.account.findUnique({ where: { id } }),
    updateRole: (id, role) => prisma_1.prisma.account.update({
        where: { id },
        data: { role }
    })
};
