import { prisma } from "../config/prisma";
import AppError from "../errors/AppError";
import { findEventById } from "../repositories/event.repository";
import { createTransaction, getUserTransactions, TransactionsStatus, getTransactionEventById, findTransactionById, updateTransationById } from "../repositories/transaction.repositori";


interface CreateTransactionInput {
    userId: number;
    eventId: number;
    ticketId: number;
    ticketQuantity: number;
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

export const getEventTransactionsService = async (eventId: number, organizerId: number) => {
    const event = await findEventById(eventId)

    if (!event || event.organizerId !== organizerId) {
        throw new AppError("Unauthorized access to event transactions", 403);
    }

    const transactions = await getTransactionEventById(eventId);
    return transactions
}

export const updateTransactionStatusService = async (
    transactionId: number,
    organizerId: number,
    status: "ACCEPTED" | "REJECTED" | "PENDING"
) => {
    const transaction = await findTransactionById(transactionId);

    if (!transaction) {
        throw new AppError("Transaction not found", 404)
    }

    if (transaction.event.organizerId !== organizerId) {
        throw new AppError("You are not the organizer of this event", 403)
    }

    if (transaction.status !== "PENDING") {
        throw new AppError("Transaction already processed", 400)
    }

    if (status === "REJECTED") {
        await prisma.ticket.update({
            where: { id: transaction.ticketId },
            data: {
                sold: {
                    decrement: transaction.ticketQuantity
                }
            }
        })
    };

    const updated = await updateTransationById(organizerId, status);
    return updated
}

