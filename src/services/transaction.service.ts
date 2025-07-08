import { prisma } from "../config/prisma";
import AppError from "../errors/AppError";
import { findEventById } from "../repositories/dashboardEvent.repository";
import { createTransaction, getUserTransactions, TransactionsStatus, getTransactionEventById } from "../repositories/transaction.repositori";


interface CreateTransactionInput {
    userId: number;
    eventId: number;
    ticketQuantity: number;
    usedCouponsId?: number;
    userPoints?: number;
}

export const createTransactionService = async (input: CreateTransactionInput) => {
    const { userId, eventId, ticketQuantity, usedCouponsId, userPoints } = input;

    const event = await prisma.event.findFirst({
        where: { id: eventId },
        include: { tickets: true },
    });

    if (!event) {
        throw new AppError("Event not found", 404);
    }

    if (event.tickets.length === 0) {
        throw new AppError("No tickets available for this event", 400);
    }

    const ticket = event.tickets[0];

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