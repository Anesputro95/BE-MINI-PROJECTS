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
exports.incrementVoucherUsage = exports.validateVoucherService = exports.getVouchersByEventService = exports.createVoucherService = void 0;
const prisma_1 = require("../config/prisma");
const AppError_1 = __importDefault(require("../errors/AppError"));
const voucher_repository_1 = require("../repositories/voucher.repository");
const createVoucherService = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const event = yield prisma_1.prisma.event.findUnique({
        where: { id: input.eventId },
    });
    if (!event)
        throw new AppError_1.default("Event not found", 404);
    if (event.organizerId !== input.organizerId) {
        throw new AppError_1.default("Unauthorized: not your event", 403);
    }
    if (input.discountAmount !== null &&
        input.discountPercent !== null)
        return (0, voucher_repository_1.createVoucher)({
            eventId: input.eventId,
            code: input.code,
            discountAmount: input.discountAmount,
            discountPercent: input.discountPercent,
            maxDiscount: input.maxDiscount,
            startDate: input.startDate,
            endDate: input.endDate,
            maxUsage: input.maxUsage,
        });
});
exports.createVoucherService = createVoucherService;
const getVouchersByEventService = (eventId) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, voucher_repository_1.getVouchersByEvent)(eventId);
});
exports.getVouchersByEventService = getVouchersByEventService;
const validateVoucherService = (code) => __awaiter(void 0, void 0, void 0, function* () {
    const voucher = yield (0, voucher_repository_1.findVoucherByCode)(code);
    if (!voucher)
        throw new AppError_1.default("Voucher not found", 404);
    const now = new Date();
    if (now < voucher.startDate || now > voucher.endDate) {
        throw new AppError_1.default("Voucher not active", 400);
    }
    if (voucher.maxUsage && voucher.usageCount >= voucher.maxUsage) {
        throw new AppError_1.default("Voucher usage limit reached", 400);
    }
    return voucher;
});
exports.validateVoucherService = validateVoucherService;
const incrementVoucherUsage = (voucherId) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.prisma.voucher.update({
        where: { id: voucherId },
        data: {
            usageCount: { increment: 1 },
        },
    });
});
exports.incrementVoucherUsage = incrementVoucherUsage;
