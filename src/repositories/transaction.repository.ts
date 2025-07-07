import { prisma } from "../config/prisma";

interface CreateTransactionDTO {
    userId: number;
    eventId: number;
    ticketQuantity: number;
    totalPrice: number;
    paymentProofUrl?: string;
    usedCouponsId?: number;
    userPoints?: number;
}

export const createTransaction = async (data: CreateTransactionDTO) => {
    return prisma.transaction.create({
        data,
    });
};

export const getUserTransactions = async (userId: number) => {
    return prisma.transaction.findMany({
        where: {userId},
        orderBy: {createdAt: "desc"},
        include: {
            event: {
                select: {
                    title: true,
                    thumbnail: true,
                },
            },
        },
    });
};