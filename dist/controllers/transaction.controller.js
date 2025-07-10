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
const transaction_service_1 = require("../services/transaction.service");
const AppError_1 = __importDefault(require("../errors/AppError"));
const transaction_repositori_1 = require("../repositories/transaction.repositori");
class TransactionController {
    getAttendList(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const eventId = Number(req.params.eventId);
                const data = yield (0, transaction_service_1.transactionService)(eventId);
                res.status(200).send({
                    success: true,
                    data,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    createTransaction(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("=== Raw Request Body ===", req.body);
                const { id: userId } = res.locals.descript;
                const { eventId, ticketId, ticketQuantity, usedCouponsId, userPoints, voucherCode } = req.body;
                console.log("Parsed voucherCode:", voucherCode);
                const transaction = yield (0, transaction_service_1.createTransactionService)({
                    userId,
                    eventId,
                    ticketId,
                    ticketQuantity,
                    usedCouponsId,
                    userPoints,
                    voucherCode,
                });
                const remainingTime = transaction.status === "WAITING_PAYMENT" && transaction.createdAt
                    ? (0, transaction_service_1.getRemainingTime)(transaction.createdAt)
                    : 0;
                res.status(201).send({
                    success: true,
                    message: "Transaction created successfully",
                    data: Object.assign(Object.assign({}, transaction), { remainingTime })
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getUserTransactions(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id: userId } = res.locals.descript;
                const transactions = yield (0, transaction_service_1.getUserTransactionsService)(userId);
                res.status(200).send({
                    success: true,
                    message: "Obtained user transaction data",
                    data: transactions,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getTransactionDetail(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id: userId } = res.locals.descript;
                const transactionId = Number(req.params.transactionId);
                const trx = yield (0, transaction_repositori_1.findTransactionById)(transactionId);
                if (!trx) {
                    throw new AppError_1.default("Transaction not found", 404);
                }
                if (trx.user.id !== userId) {
                    throw new AppError_1.default("Unathorized to view this transaction", 403);
                }
                const { expired, remainingTime } = yield (0, transaction_service_1.expireTransactionIfNeeded)(trx.id, trx.createdAt, trx.status);
                const currentStatus = expired ? "EXPIRED" : trx.status;
                res.status(200).send({
                    success: true,
                    message: "Transaction detail retrieved",
                    data: Object.assign(Object.assign({}, trx), { status: currentStatus, remainingTime }),
                });
            }
            catch (error) {
                next(error);
            }
            ;
        });
    }
    ;
    uploadPaymentProof(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id: userId } = res.locals.descript;
                const transactionId = Number(req.params.transactionId);
                const { paymentProofUrl } = req.body;
                const trx = yield (0, transaction_service_1.uploadPaymentProofService)(transactionId, paymentProofUrl, userId);
                res.status(200).send({
                    success: true,
                    message: "Payment proof uploaded",
                    data: trx,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    confirmTransaction(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id: organizerId } = res.locals.descript;
                const transactionId = Number(req.params.transactionId);
                const { action } = req.body;
                const trx = yield (0, transaction_service_1.transactionService)(transactionId);
                res.status(200).send({
                    success: true,
                    message: `Transaction ${action === "ACCEPT" ? "accepted" : "rejected"}`,
                    data: trx,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getEventStatistic(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id: userId } = res.locals.descript;
                if (!userId) {
                    throw new AppError_1.default("Unauthorized: No user ID found", 401);
                }
                const transactions = yield (0, transaction_service_1.getUserTransactionsService)(userId);
                res.status(200).send({
                    success: true,
                    message: "Event statistics retrieved",
                    data: transactions,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = TransactionController;
