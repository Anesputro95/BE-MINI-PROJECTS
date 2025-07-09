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
};

export const updateTransactionById = async (
    id: number,
    status: "WAITING_PAYMENT" | "WAITING_CONFIRMATION" | "DONE" | "REJECTED" | "EXPIRED" | "CANCELED") => {
    return prisma.transaction.update({
        where: { id },
        data: { status },
    })
};

export const getTransactionStatsByInterval = async (eventId: number, interval: string) => {
    const allowed = ["day", "month", "year"];
    if (!allowed.includes(interval)) {
        throw new Error("Invalid interval")
    }


    type StatisticResult = {
        period: Date;
        totalTransactions: bigint;
        totalRevenue: bigint;
    }
    
    return prisma.$queryRaw`
        SELECT
            date_trunc(${interval}::text, "createdAt") AS period,
            COUNT(*) AS "totalTransactions",
            SUM("totalPrice") AS "totalRevenue"
        FROM "transaction"
        WHERE "eventId" = ${eventId} AND status = 'DONE'
        GROUP BY period
        ORDER BY period ASC
        `;
};
