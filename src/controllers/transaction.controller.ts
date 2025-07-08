import { Request, Response, NextFunction } from "express";
import {
    transactionService,
    createTransactionService,
    getUserTransactionsService,

    uploadPaymentProofService,
    confirmTransactionService

} from "../services/transaction.service";
import { getEventTransactionsService } from "../services/transaction.service"

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

            res.status(201).send({
                success: true,
                message: "Transaction created successfully",
                data: transaction,
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


    public async uploadPaymentProof (

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

}

export default TransactionController;
