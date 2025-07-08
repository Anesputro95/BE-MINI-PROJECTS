import { prisma } from "../config/prisma";

export const TransactionsStatus = async (eventId: number) => {
    return prisma.transaction.findMany({
        where: {
            eventId,
            status: "ACCEPTED"
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
}

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
        where: { userId },
        orderBy: { createdAt: "desc" },
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

export const getTransactionById = async (eventId: number) => {

}