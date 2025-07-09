import { transport } from "../config/nodemailer"
import { prisma } from "../config/prisma";
import AppError from "../errors/AppError";
import { findEventById } from "../repositories/event.repository";
import { createTransaction, getUserTransactions, TransactionsStatus, getTransactionEventById, findTransactionById, updateTransactionById, getTransactionStatsByInterval, findTransactionWithUserAndEvent } from "../repositories/transaction.repositori";
import { restoreAllResources } from "../utils/restoreAllResources";



interface CreateTransactionInput {
    userId: number;
    eventId: number;
    ticketId: number;
    ticketQuantity: number;
    paymentProofUrl?: string;
    usedCouponsId?: number;
    userPoints?: number;
}

export const createTransactionService = async (input: CreateTransactionInput) => {
    const { userId, eventId, ticketId, ticketQuantity, usedCouponsId, userPoints } = input;

    const ticket = await prisma.ticket.findFirst({
        where: { id: ticketId, eventId },
    });

    if (!ticket) {
        throw new AppError("Ticket not found for this event", 404);
    }

    if (ticket.quota - ticket.sold < ticketQuantity) {
        throw new AppError("Not enough ticket quota", 400);
    }

    let totalPrice = ticket.price * ticketQuantity;

    // Validasi kupon
    if (usedCouponsId) {
        const coupon = await prisma.coupon.findUnique({ where: { id: usedCouponsId } });

        if (!coupon) {
            throw new AppError("Coupon not found", 404);
        }
        if (coupon.isUsed) {
            throw new AppError("Coupon has already been used", 400);
        }
        if (coupon.expiresAt < new Date()) {
            throw new AppError("Coupon has expired", 400);
        }

        totalPrice -= coupon.discount;
        if (totalPrice < 0) totalPrice = 0;
    }

    // Validasi dan kurangi poin
    const user = await prisma.account.findUnique({
        where: { id: userId },
        select: { points: true },
    });

    if (!user) {
        throw new AppError("User not found", 404);
    }

    if (userPoints && userPoints > 0) {
        if (!user || typeof user.points !== "number") {
            throw new AppError("Invalid user or points data", 500);
        }

        if (userPoints > totalPrice) {
            throw new AppError("User points exceed total price", 400);
        }
        totalPrice -= userPoints;
    }

    const transaction = await createTransaction({
        userId,
        eventId,
        ticketId,
        ticketQuantity,
        totalPrice,
        status: "WAITING_PAYMENT",
        restored: false,
        usedCouponsId,
        userPoints,
    });

    // Update tiket terjual
    await prisma.ticket.update({
        where: { id: ticket.id },
        data: {
            sold: ticket.sold + ticketQuantity,
        },
    });

    return transaction;
};


export const getUserTransactionsService = async (userId: number) => {
    const transactions = await getUserTransactions(userId);

    const updated = await Promise.all(
        transactions.map(async (trx) => {
            if (trx.createdAt && trx.status === "WAITING_PAYMENT") {
                const { expired, remainingTime } = await expireTransactionIfNeeded(
                    trx.id,
                    trx.createdAt,
                    trx.status
                );
                return {
                    ...trx,
                    status: expired ? "EXPIRED" : trx.status,
                    remainingTime,
                };
            }

            return {
                ...trx,
                remainingTime: 0,
            };
        })
    );

    return updated;
};

export const transactionService = async (eventId: number) => {
    const attendes = await TransactionsStatus(eventId);

    return attendes.map(
        (trx: {
            ticketQuantity: number;
            totalPrice: number;
            user: { username: string; email: string };
        }) => ({
            name: trx.user.username,
            email: trx.user.email,
            quantity: trx.ticketQuantity,
            totalPrice: trx.totalPrice,
        }));
};


export const uploadPaymentProofService = async (
    transactionId: number,
    paymentProofUrl: string,
    userId: number
) => {
    const trx = await prisma.transaction.findUnique({
        where: { id: transactionId },
    });

    if (!trx) {
        throw new AppError("Transaction not found", 404);
    }

    if (trx.userId !== userId) {
        throw new AppError("Unauthorized", 403);
    }

    if (trx.status !== "WAITING_PAYMENT") {
        throw new AppError("Cannot upload payment proof for this status", 400);
    }

    return prisma.transaction.update({
        where: { id: transactionId },
        data: {
            paymentProofUrl,
            paymentProofUploadedAt: new Date(),
            status: "WAITING_CONFIRMATION",
        },
    });
};

export const expireTransactionIfNeeded = async (transactionId: number, createdAt: Date, status: string) => {
    const remainingTime = getRemainingTime(createdAt);

    if (status === "WAITING_PAYMENT" && remainingTime <= 0) {
        await updateTransactionById(transactionId, "EXPIRED");
        return { expired: true };
    }

    return { expired: false, remainingTime };
};

export const confirmTransactionService = async (
    transactionId: number,
    action: "ACCEPT" | "REJECT",
    organizerId: number
) => {
    const trx = await findTransactionWithUserAndEvent(transactionId)

    if (!trx) {
        throw new AppError("Transaction not found", 404);
    }

    if (trx.event.organizerId !== organizerId) {
        throw new AppError("Unauthorized", 403);
    }

    if (trx.status !== "WAITING_CONFIRMATION") {
        throw new AppError("Transaction is not pending confirmation", 400);
    }

    if (action === "REJECT") {
        await restoreAllResources(trx);

        await transport.sendMail({
            to: trx.user.email,
            subject: "Your transaction was rejected",
            html: `
                <p>Hi ${trx.user.username},</p>
                <p>Unfortunately, your transaction for <b>${trx.event.title}</b> was <span style="color:red">rejected</span>.</p>
            `,
        });
    }

    if (action === "ACCEPT") {
        // ✅ Jika transaksi diterima, tandai kupon sebagai digunakan
        if (trx.usedCouponsId) {
            await prisma.coupon.update({
                where: { id: trx.usedCouponsId },
                data: { isUsed: true },
            });
        }

        await transport.sendMail({
            to: trx.user.email,
            subject: "Your transaction was accepted",
            html: `
                <p>Hi ${trx.user.username},</p>
                <p>Congratulations! Your transaction for <b>${trx.event.title}</b> was <span style="color:green">accepted</span>.</p>
            `,
        });
    }

    return prisma.transaction.update({
        where: { id: transactionId },
        data: {
            status: action === "ACCEPT" ? "DONE" : "REJECTED",
        },
    });
};


export const getEventStatisticService = async (
    eventId: number,
    interval: "day" | "month" | "year"
) => {
    const allowedIntervals = ["day", "month", "year"];
    if (!allowedIntervals.includes(interval)) {
        throw new Error("Invalid interval");
    }
    
    return getTransactionStatsByInterval(eventId, interval);
 };

 export const getRemainingTime = (createdAt: Date) => {
    const deadline = new Date(createdAt.getTime() + 15 * 60 * 1000); // 15 menit biar ga kelamaan buat jastip
    const remainingMs = deadline.getTime() - Date.now();

    return remainingMs > 0 ? remainingMs : 0;
};
