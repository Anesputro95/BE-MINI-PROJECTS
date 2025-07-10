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
exports.restoreAllResources = void 0;
const prisma_1 = require("../config/prisma");
const restoreAllResources = (trx) => __awaiter(void 0, void 0, void 0, function* () {
    const operations = [];
    // kembalikan kursi tiket
    operations.push(prisma_1.prisma.ticket.update({
        where: { id: trx.ticketId },
        data: {
            sold: {
                decrement: trx.ticketQuantity,
            },
        },
    }));
    //  Kembalikan kupon jika ada
    if (trx.usedCouponsId) {
        operations.push(prisma_1.prisma.coupon.update({
            where: { id: trx.usedCouponsId },
            data: { isUsed: false },
        }));
    }
    // Tambahkan kembali user point (jika sebelumnya digunakan)
    if (trx.userPoints && trx.userPoints > 0) {
        operations.push(prisma_1.prisma.userPoint.create({
            data: {
                userId: trx.user.id,
                amount: trx.userPoints,
                expiredAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            }
        }));
    }
});
exports.restoreAllResources = restoreAllResources;
