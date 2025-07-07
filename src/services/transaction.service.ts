import { TransactionsStatus } from "../repositories/transaction.repositori";

export const transactionService = async (eventId: number) => {
    const attendes = await TransactionsStatus(eventId);

    return attendes.map((trx) => ({
        name: trx.user.username,
        email: trx.user.email,
        quantity: trx.ticketQuantity,
        totalPrice: trx.totalPrice,
    }))
}