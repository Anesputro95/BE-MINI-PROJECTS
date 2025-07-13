import { create } from "domain";
import { prisma } from "../config/prisma";
import AppError from "../errors/AppError";
import {
    createVoucher,
    getVouchersByEvent,
    findVoucherByCode,
    getMyCoupons,
} from "../repositories/voucher.repository";

export const createVoucherService = async (input: {
    eventId: number;
    code: string;
    discountAmount?: number;
    discountPercent?: number;
    maxDiscount?: number;
    startDate: Date;
    endDate: Date;
    maxUsage: number;
    organizerId: number;
}) => {
    const event = await prisma.event.findUnique({
        where: { id: input.eventId },
    });

    if (!event) throw new AppError("Event not found", 404);

    if (event.organizerId !== input.organizerId) {
        throw new AppError("Unauthorized: not your event", 403);
    }

    if (
        input.discountAmount !== null &&
        input.discountPercent !== null
    )

        return createVoucher({
            eventId: input.eventId,
            code: input.code,
            discountAmount: input.discountAmount,
            discountPercent: input.discountPercent,
            maxDiscount: input.maxDiscount,
            startDate: input.startDate,
            endDate: input.endDate,
            maxUsage: input.maxUsage,
        });
};

export const getVouchersByEventService = async (eventId: number) => {
    return getVouchersByEvent(eventId);
};

export const validateVoucherService = async (code: string) => {
    const voucher = await findVoucherByCode(code);
    if (!voucher) throw new AppError("Voucher not found", 404);

    const now = new Date();
    if (now < voucher.startDate || now > voucher.endDate) {
        throw new AppError("Voucher not active", 400);
    }

    if (voucher.maxUsage && voucher.usageCount >= voucher.maxUsage) {
        throw new AppError("Voucher usage limit reached", 400);
    }

    return voucher;
};

export const incrementVoucherUsage = async (voucherId: number) => {
    await prisma.voucher.update({
        where: { id: voucherId },
        data: {
            usageCount: { increment: 1 },
        },
    });
};

export const getMyCouponsService = async (userId: number) => {
    return getMyCoupons(userId);
}   