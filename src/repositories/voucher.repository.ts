import { prisma } from "../config/prisma";

export const createVoucher = async (data: {
    eventId: number;
    code: string;
    discountAmount: number;
    startDate: Date;
    endDate: Date;
    maxUsage: number;
}) => {
    return prisma.voucher.create({data});
};

export const getVouchersByEvent = async (eventId: number) => {
    return prisma.voucher.findMany({
        where: {eventId},
        orderBy: {createdAt: "desc"}
    });
};

export const findVoucherByCode = async (code: string) => {
    return prisma.voucher.findUnique({
        where: {code},
    });
};

export const incrementVoucherUsage = async (id: number) => {
    return prisma.voucher.update({
        where: {id},
        data: {usageCount: {increment: 1}},
    });
};