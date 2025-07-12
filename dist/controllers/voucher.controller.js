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
const voucher_service_1 = require("../services/voucher.service");
class VoucherController {
    createVoucher(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id: organizerId } = res.locals.descript;
                const { eventId, code, discountAmount, discountPercent, maxDiscount, startDate, endDate, maxUsage, } = req.body;
                const voucher = yield (0, voucher_service_1.createVoucherService)({
                    eventId,
                    code,
                    discountAmount,
                    discountPercent,
                    maxDiscount,
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                    maxUsage,
                    organizerId,
                });
                res.status(201).send({
                    success: true,
                    message: "Voucher created successfully",
                    data: voucher,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getVouchersByEvent(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const eventId = Number(req.params.eventId);
                const vouchers = yield (0, voucher_service_1.getVouchersByEventService)(eventId);
                res.status(200).send({
                    success: true,
                    message: "Vouchers retrieved",
                    data: vouchers,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = VoucherController;
