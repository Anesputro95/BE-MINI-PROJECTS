import { prisma } from "../config/prisma";
import AppError from "../errors/AppError";
import { createTransaction, getUserTransactions, TransactionsStatus } from "../repositories/transaction.repositori";

interface CreateTransactionInput {
    userId: number;
    eventId: number;
    ticketId: number;
    ticketQuantity: number;
    usedCouponsId?: number;
    userPoints?: number;
}

// 👇 Service untuk bikin transaksi
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

// 👇 Service untuk history transaksi user
export const getUserTransactionsService = async (userId: number) => {
    return getUserTransactions(userId);
};

// 👇 Service untuk ambil data attendee berdasarkan event
export const transactionService = async (eventId: number) => {
    const attendes = await TransactionsStatus(eventId);

    return attendes.map((trx) => ({
        name: trx.user.username,
        email: trx.user.email,
        quantity: trx.ticketQuantity,
        totalPrice: trx.totalPrice,
    }));
};