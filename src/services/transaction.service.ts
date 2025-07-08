import { prisma } from "../config/prisma";
import AppError from "../errors/AppError";
import { findEventById } from "../repositories/event.repository";
import { createTransaction, getUserTransactions, TransactionsStatus, getTransactionEventById, findTransactionById, updateTransationById } from "../repositories/transaction.repositori";




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

        where: { 
            id: ticketId,
            eventId: eventId, 
        },
    });

    if (!ticket) {
        throw new AppError("Ticket not found for this event", 404);
    }


    if (ticket.quota - ticket.sold < ticketQuantity) {
        throw new AppError("Not enough ticket quota", 400);
    }
 
    let totalPrice = ticket.price * ticketQuantity;

    if (userPoints && userPoints > 0) {
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

    await prisma.ticket.update({
        where: { id: ticket.id },
        data: {
            sold: ticket.sold + ticketQuantity,
        },
    });

    return transaction;
};

export const getUserTransactionsService = async (userId: number) => {
    return getUserTransactions(userId);
};

export const transactionService = async (eventId: number) => {
    const attendes = await TransactionsStatus(eventId);

    return attendes.map((trx) => ({
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
        where: {id: transactionId},
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
        where: {id: transactionId},
        data: {
            paymentProofUrl,
            paymentProofUploadedAt: new Date(),
            status: "WAITING_CONFIRMATION",
        },
    });
};

export const confirmTransactionService = async (
    transactionId: number,
    action: "ACCEPT" | "REJECT",
    organizerId: number
) => {
    const trx = await prisma.transaction.findUnique({
        where: {id: transactionId},
        include: {event: true},
    });

    if (!trx) {
        throw new AppError("Transaction not found", 404);
    }

    if (trx.event.organizerId !== organizerId) {
        throw new AppError("Unauthorized", 403);
    }

    if (trx.status !== "WAITING_CONFIRMATION") {
        throw new AppError("Transaction is not pending confirmation", 400);
    }

    return prisma.transaction.update({
        where: {id: transactionId},
        data: {
            status: action === "ACCEPT" ? "DONE" : "REJECTED",
        },
    });

};

