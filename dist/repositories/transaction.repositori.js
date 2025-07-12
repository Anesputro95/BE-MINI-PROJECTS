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
exports.findTransactionWithUserAndEvent = exports.getTransactionStatsByInterval = exports.updateTransactionById = exports.findTransactionById = exports.getTransactionEventById = exports.getUserTransactions = exports.createTransaction = exports.TransactionsStatus = void 0;
const prisma_1 = require("../config/prisma");
const TransactionsStatus = (eventId) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.prisma.transaction.findMany({
        where: {
            eventId,
            status: "DONE"
        },
        select: {
            ticketQuantity: true,
            totalPrice: true,
            user: {
                select: {
                    username: true,
                    email: true,
                }
            }
        }
    });
});
exports.TransactionsStatus = TransactionsStatus;
const createTransaction = (data) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.prisma.transaction.create({
        data,
    });
});
exports.createTransaction = createTransaction;
const getUserTransactions = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: {
            event: {
                select: {
                    title: true,
                    thumbnail: true,
                },
            },
            voucher: {
                select: {
                    code: true,
                    discountAmount: true
                }
            },
        },
    });
});
exports.getUserTransactions = getUserTransactions;
const getTransactionEventById = (eventId) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.prisma.transaction.findMany({
        where: { eventId },
        select: {
            id: true,
            status: true,
            totalPrice: true,
            ticketQuantity: true,
            paymentProofUrl: true,
            createdAt: true,
            user: {
                select: {
                    username: true,
                    email: true,
                }
            }
        }
    });
});
exports.getTransactionEventById = getTransactionEventById;
const findTransactionById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.prisma.transaction.findUnique({
        where: { id },
        select: {
            id: true,
            ticketId: true,
            ticketQuantity: true,
            status: true,
            createdAt: true,
            event: {
                select: {
                    id: true,
                    organizerId: true,
                },
            },
            user: {
                select: {
                    id: true,
                    email: true,
                },
            },
        },
    });
});
exports.findTransactionById = findTransactionById;
const updateTransactionById = (id, status) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.prisma.transaction.update({
        where: { id },
        data: { status },
    });
});
exports.updateTransactionById = updateTransactionById;
const getTransactionStatsByInterval = (eventId, interval) => __awaiter(void 0, void 0, void 0, function* () {
    const allowed = ["day", "month", "year"];
    if (!allowed.includes(interval)) {
        throw new Error("Invalid interval");
    }
    return prisma_1.prisma.$queryRaw `
        SELECT
            date_trunc(${interval}::text, "createdAt") AS period,
            COUNT(*) AS "totalTransactions",
            SUM("totalPrice") AS "totalRevenue"
        FROM "transaction"
        WHERE "eventId" = ${eventId} AND status = 'DONE'
        GROUP BY period
        ORDER BY period ASC
        `;
});
exports.getTransactionStatsByInterval = getTransactionStatsByInterval;
const findTransactionWithUserAndEvent = (transactionId) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.prisma.transaction.findUnique({
        where: { id: transactionId },
        select: {
            id: true,
            status: true,
            usedCouponsId: true,
            event: {
                select: {
                    id: true,
                    title: true,
                    organizerId: true,
                },
            },
            user: {
                select: {
                    id: true,
                    username: true,
                    email: true,
                },
            },
        },
    });
});
exports.findTransactionWithUserAndEvent = findTransactionWithUserAndEvent;
