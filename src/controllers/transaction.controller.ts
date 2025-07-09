import { Request, Response, NextFunction } from "express";
import {
    transactionService,
    createTransactionService,
    getUserTransactionsService,

    uploadPaymentProofService,
    confirmTransactionService,
    getEventStatisticService,
    expireTransactionIfNeeded,

    getRemainingTime

} from "../services/transaction.service";
import AppError from "../errors/AppError";
import { findTransactionById } from "../repositories/transaction.repositori";


class TransactionController {
    public async getAttendList(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const eventId = Number(req.params.eventId);
            const data = await transactionService(eventId);

            res.status(200).send({
                success: true,
                data,
            });
        } catch (error) {
            next(error);
        }
    }

    public async createTransaction(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const { id: userId } = res.locals.descript;
            const { eventId, ticketId, ticketQuantity, usedCouponsId, userPoints } = req.body;

            const transaction = await createTransactionService({
                userId,
                eventId,
                ticketId,
                ticketQuantity,
                usedCouponsId,
                userPoints,
            });

            const remainingTime =
                transaction.status === "WAITING_PAYMENT" && transaction.createdAt
                ? getRemainingTime(transaction.createdAt)
                :0;

            res.status(201).send({
                success: true,
                message: "Transaction created successfully",
                data: {
                    ...transaction,
                    remainingTime,
                }
            });
        } catch (error) {
            next(error);
        }
    }

    public async getUserTransactions(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const { id: userId } = res.locals.descript;

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

    public async getTransactionDetail(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try{
            const {id: userId} = res.locals.descript;
            const transactionId = Number(req.params.transactionId);

            const trx = await findTransactionById(transactionId);

            if(!trx) {
                throw new AppError("Transaction not found", 404);
            }

            if (trx.user.id !== userId) {
                throw new AppError("Unathorized to view this transaction", 403);
            }

            const {expired, remainingTime } = await expireTransactionIfNeeded(
                trx.id,
                trx.createdAt!,
                trx.status
            );

            const currentStatus = expired ? "EXPIRED" : trx.status;

            res.status(200).send({
                success: true,
                message: "Transaction detail retrieved",
                data: {
                    ... trx,
                    status: currentStatus,
                    remainingTime,
                },
            });
        } catch (error) {
            next(error);
        };
    };


    public async uploadPaymentProof(

        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {

            const { id: userId } = res.locals.descript;
            const transactionId = Number(req.params.transactionId);
            const { paymentProofUrl } = req.body;

            const trx = await uploadPaymentProofService(transactionId, paymentProofUrl, userId);

            res.status(200).send({
                success: true,
                message: "Payment proof uploaded",
                data: trx,
            });
        } catch (error) {
            next(error);
        }
    }

    public async confirmTransaction(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const { id: organizerId } = res.locals.descript;
            const transactionId = Number(req.params.transactionId);
            const { action } = req.body; // "ACCEPT" or "REJECT"

            const trx = await confirmTransactionService(transactionId, action, organizerId);

            res.status(200).send({
                success: true,
                message: `Transaction ${action === "ACCEPT" ? "accepted" : "rejected"}`,
                data: trx,
            });
        } catch (error) {
            next(error);
        }
    }

    public async getEventStatistic(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const { id: userId } = res.locals.descript;

            if (!userId) {
                throw new AppError("Unauthorized: No user ID found", 401);
            }

            const transactions = await getUserTransactionsService(userId);

            res.status(200).send({
                success: true,
                message: "Event statistics retrieved",
                data: transactions,
            })
        } catch (error) {
            next(error);
        }
    }


}

export default TransactionController;
