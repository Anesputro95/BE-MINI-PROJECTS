import { prisma } from "../config/prisma";

export const TransactionsStatus = async (eventId: number) => {
    return prisma.transaction.findMany({
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
}

interface CreateTransactionDTO {
    userId: number;
    eventId: number;
    ticketId: number;
    ticketQuantity: number;
    totalPrice: number;
    status: "WAITING_PAYMENT" | "WAITING_CONFIRMATION" | "DONE" | "REJECTED" | "EXPIRED" | "CANCELED";
    restored: boolean,
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

export const getTransactionEventById = async (eventId: number) => {
    return prisma.transaction.findMany({
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
    })
}

export const findTransactionById = async (id: number) => {
    return prisma.transaction.findUnique({
        where: { id },
        select: {
            id: true,
            ticketId: true,
            ticketQuantity: true,
            status: true,
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
};


export const updateTransactionById = async (
    id: number,
    status: "WAITING_PAYMENT" | "WAITING_CONFIRMATION" | "DONE" | "REJECTED" | "EXPIRED" | "CANCELED") => {
    return prisma.transaction.update({
        where: { id },
        data: { status },
    })
};

export const getTransactionStatsByDay = async (eventId: number) => {
    return prisma.$queryRaw`
    SELECT
      DATE("createdAt") as date,
      COUNT(*) as totalTransactions,
      SUM("totalPrice") as totalRevenue
    FROM "Transaction"
    WHERE "eventId" = ${eventId} AND status = 'DONE'
    GROUP BY date
    ORDER BY date ASC
  `;
}

export const getTransactionStatsByMonth = async (eventId: number) => {
    return prisma.$queryRaw`
    SELECT
        DATE_TRUNC('month', 'createdAt') as month,
        COUNT(*) as totalTransactions,
        SUM("totalPrice") as totalRevenue
    FROM "Transaction"
    WHERE "eventId" = ${eventId} AND status = 'DONE'
    GROUP BY date
    ORDER BY date ASC
    `;
}

export const getTransactionStatsByYear = async (eventId: number) => {
    return prisma.$queryRaw`
    SELECT
        DATE_TRUNC('year', 'createdAt') as month,
        COUNT(*) as totalTransactions,
        SUM("totalPrice") as totalRevenue
    FROM "Transaction"
    WHERE "eventId" = ${eventId} AND status = 'DONE'
    GROUP BY date
    ORDER BY date ASC
    `
}