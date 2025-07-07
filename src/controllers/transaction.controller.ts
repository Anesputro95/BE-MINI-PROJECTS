import {Request, Response, NextFunction} from "express";
import { createTransactionService, getUserTransactionsService } from "../services/transaction.service";

class TransactionController {
    public async createTransaction (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const { id: userId} = res.locals.descript;
            const { eventId, ticketQuantity, usedCouponsId, userPoints} = req.body;

            const transaction = await createTransactionService({
                userId,
                eventId,
                ticketQuantity,
                usedCouponsId,
                userPoints,
            });

            res.status(201).send({
                success: true,
                message: "Transaction created successfully",
                data: transaction,
            });
        } catch (error) {
            next (error);
        }
    }

    public async getUserTransactions (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise <void> {
        try {
            const {id: userId} = res.locals.descript;

            const transactions = await getUserTransactionsService(userId);

            res.status(200).send({
                success: true,
                message: "Obtained user transaction data",
                data: transactions,
            });
        } catch (error) {
            next(error);
        }
    }
};

export default TransactionController;