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
exports.incrementVoucherUsage = exports.findVoucherByCode = exports.getVouchersByEvent = exports.createVoucher = void 0;
const prisma_1 = require("../config/prisma");
const createVoucher = (data) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.prisma.voucher.create({ data });
});
exports.createVoucher = createVoucher;
const getVouchersByEvent = (eventId) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.prisma.voucher.findMany({
        where: { eventId },
        orderBy: { createdAt: "desc" }
    });
});
exports.getVouchersByEvent = getVouchersByEvent;
const findVoucherByCode = (code) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.prisma.voucher.findUnique({
        where: { code },
    });
});
exports.findVoucherByCode = findVoucherByCode;
const incrementVoucherUsage = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.prisma.voucher.update({
        where: { id },
        data: { usageCount: { increment: 1 } },
    });
});
exports.incrementVoucherUsage = incrementVoucherUsage;
