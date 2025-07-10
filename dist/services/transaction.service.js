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
exports.getRemainingTime = exports.getEventStatisticService = exports.confirmTransactionService = exports.expireTransactionIfNeeded = exports.uploadPaymentProofService = exports.transactionService = exports.getUserTransactionsService = exports.createTransactionService = void 0;
const nodemailer_1 = require("../config/nodemailer");
const prisma_1 = require("../config/prisma");
const AppError_1 = __importDefault(require("../errors/AppError"));
const transaction_repositori_1 = require("../repositories/transaction.repositori");
const restoreAllResources_1 = require("../utils/restoreAllResources");
const voucher_service_1 = require("./voucher.service");
const createTransactionService = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, eventId, ticketId, ticketQuantity, usedCouponsId, userPoints, voucherCode } = input;
    const ticket = yield prisma_1.prisma.ticket.findFirst({
        where: { id: ticketId, eventId },
    });
    if (!ticket) {
        throw new AppError_1.default("Ticket not found for this event", 404);
    }
    if (ticket.quota - ticket.sold < ticketQuantity) {
        throw new AppError_1.default("Not enough ticket quota", 400);
    }
    let totalPrice = ticket.price * ticketQuantity;
    // Validasi kupon
    if (usedCouponsId) {
        const coupon = yield prisma_1.prisma.coupon.findUnique({ where: { id: usedCouponsId } });
        if (!coupon) {
            throw new AppError_1.default("Coupon not found", 404);
        }
        if (coupon.isUsed) {
            throw new AppError_1.default("Coupon has already been used", 400);
        }
        if (coupon.expiresAt < new Date()) {
            throw new AppError_1.default("Coupon has expired", 400);
        }
        totalPrice -= coupon.discount;
        if (totalPrice < 0)
            totalPrice = 0;
    }
    let voucherId;
    if (voucherCode) {
        const voucher = yield (0, voucher_service_1.validateVoucherService)(voucherCode);
        if (voucher.eventId !== eventId) {
            throw new AppError_1.default("Voucher does not belong to this event", 400);
        }
        voucherId = voucher.id;
        let discount = 0;
        if (voucher.discountAmount) {
            discount += voucher.discountAmount;
        }
        if (voucher.discountPercent) {
            const percentageDiscount = totalPrice * (voucher.discountPercent / 100);
            if (voucher.maxDiscount) {
                discount += Math.min(percentageDiscount, voucher.maxDiscount);
            }
            else {
                discount += percentageDiscount;
            }
        }
        if (discount > totalPrice)
            discount = totalPrice;
        totalPrice -= discount;
        yield (0, voucher_service_1.incrementVoucherUsage)(voucher.id);
        console.log("=== Voucher Validation ===");
        console.log("voucherCode:", voucherCode);
        console.log("voucher object:", voucher);
        console.log("voucherId:", voucherId);
        console.log("discount applied:", discount);
    }
    // Validasi dan kurangi poin
    const user = yield prisma_1.prisma.account.findUnique({
        where: { id: userId },
        select: { points: true },
    });
    if (!user) {
        throw new AppError_1.default("User not found", 404);
    }
    if (userPoints && userPoints > 0) {
        if (!user || typeof user.points !== "number") {
            throw new AppError_1.default("Invalid user or points data", 500);
        }
        if (userPoints > totalPrice) {
            throw new AppError_1.default("User points exceed total price", 400);
        }
        totalPrice -= userPoints;
    }
    console.log("=== Final Transaction Payload ===", {
        userId,
        eventId,
        ticketId,
        ticketQuantity,
        totalPrice,
        status: "WAITING_PAYMENT",
        restored: false,
        usedCouponsId,
        voucherId,
        userPoints,
    });
    const transaction = yield (0, transaction_repositori_1.createTransaction)({
        userId,
        eventId,
        ticketId,
        ticketQuantity,
        totalPrice,
        status: "WAITING_PAYMENT",
        restored: false,
        usedCouponsId,
        voucherId,
        userPoints,
    });
    // Update tiket terjual
    yield prisma_1.prisma.ticket.update({
        where: { id: ticket.id },
        data: {
            sold: ticket.sold + ticketQuantity,
        },
    });
    return transaction;
});
exports.createTransactionService = createTransactionService;
const getUserTransactionsService = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const transactions = yield (0, transaction_repositori_1.getUserTransactions)(userId);
    const updated = yield Promise.all(transactions.map((trx) => __awaiter(void 0, void 0, void 0, function* () {
        if (trx.createdAt && trx.status === "WAITING_PAYMENT") {
            const { expired, remainingTime } = yield (0, exports.expireTransactionIfNeeded)(trx.id, trx.createdAt, trx.status);
            return Object.assign(Object.assign({}, trx), { status: expired ? "EXPIRED" : trx.status, remainingTime });
        }
        return Object.assign(Object.assign({}, trx), { remainingTime: 0 });
    })));
    return updated;
});
exports.getUserTransactionsService = getUserTransactionsService;
const transactionService = (eventId) => __awaiter(void 0, void 0, void 0, function* () {
    const attendes = yield (0, transaction_repositori_1.TransactionsStatus)(eventId);
    return attendes.map((trx) => ({
        name: trx.user.username,
        email: trx.user.email,
        quantity: trx.ticketQuantity,
        totalPrice: trx.totalPrice,
    }));
});
exports.transactionService = transactionService;
const uploadPaymentProofService = (transactionId, paymentProofUrl, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const trx = yield prisma_1.prisma.transaction.findUnique({
        where: { id: transactionId },
    });
    if (!trx) {
        throw new AppError_1.default("Transaction not found", 404);
    }
    if (trx.userId !== userId) {
        throw new AppError_1.default("Unauthorized", 403);
    }
    if (trx.status !== "WAITING_PAYMENT") {
        throw new AppError_1.default("Cannot upload payment proof for this status", 400);
    }
    return prisma_1.prisma.transaction.update({
        where: { id: transactionId },
        data: {
            paymentProofUrl,
            paymentProofUploadedAt: new Date(),
            status: "WAITING_CONFIRMATION",
        },
    });
});
exports.uploadPaymentProofService = uploadPaymentProofService;
const expireTransactionIfNeeded = (transactionId, createdAt, status) => __awaiter(void 0, void 0, void 0, function* () {
    const remainingTime = (0, exports.getRemainingTime)(createdAt);
    if (status === "WAITING_PAYMENT" && remainingTime <= 0) {
        yield (0, transaction_repositori_1.updateTransactionById)(transactionId, "EXPIRED");
        return { expired: true };
    }
    return { expired: false, remainingTime };
});
exports.expireTransactionIfNeeded = expireTransactionIfNeeded;
const confirmTransactionService = (transactionId, action, organizerId) => __awaiter(void 0, void 0, void 0, function* () {
    const trx = yield (0, transaction_repositori_1.findTransactionWithUserAndEvent)(transactionId);
    if (!trx) {
        throw new AppError_1.default("Transaction not found", 404);
    }
    if (trx.event.organizerId !== organizerId) {
        throw new AppError_1.default("Unauthorized", 403);
    }
    if (trx.status !== "WAITING_CONFIRMATION") {
        throw new AppError_1.default("Transaction is not pending confirmation", 400);
    }
    if (action === "REJECT") {
        yield (0, restoreAllResources_1.restoreAllResources)(trx);
        yield nodemailer_1.transport.sendMail({
            to: trx.user.email,
            subject: "Your transaction was rejected",
            html: `
                <p>Hi ${trx.user.username},</p>
                <p>Unfortunately, your transaction for <b>${trx.event.title}</b> was <span style="color:red">rejected</span>.</p>
            `,
        });
    }
    if (trx.usedCouponsId) {
        yield prisma_1.prisma.coupon.update({
            where: { id: trx.usedCouponsId },
            data: { isUsed: false }
        });
    }
    return prisma_1.prisma.transaction.update({
        where: { id: transactionId },
        data: {
            status: action === "ACCEPT" ? "DONE" : "REJECTED",
        },
    });
});
exports.confirmTransactionService = confirmTransactionService;
const getEventStatisticService = (eventId, interval) => __awaiter(void 0, void 0, void 0, function* () {
    const allowedIntervals = ["day", "month", "year"];
    if (!allowedIntervals.includes(interval)) {
        throw new Error("Invalid interval");
    }
    return (0, transaction_repositori_1.getTransactionStatsByInterval)(eventId, interval);
});
exports.getEventStatisticService = getEventStatisticService;
const getRemainingTime = (createdAt) => {
    const deadline = new Date(createdAt.getTime() + 15 * 60 * 1000); // 15 menit biar ga kelamaan buat jastip
    const remainingMs = deadline.getTime() - Date.now();
    return remainingMs > 0 ? remainingMs : 0;
};
exports.getRemainingTime = getRemainingTime;
