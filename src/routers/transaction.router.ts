import { Router } from 'express';
import TransactionController from '../controllers/transaction.controller';
import { verifyToken } from '../middleware/verifyToken';
import { isOrganizer } from '../middleware/isOrganizer';
import { isCustomer } from '../middleware/isCustomer';

class TransactionRouter {
    private router: Router;
    private transactionController: TransactionController;

    constructor() {
        this.router = Router();
        this.transactionController = new TransactionController();
        this.initialRoute();
    }

    private initialRoute(): void {
        this.router.get(
            "/attendees/:eventId",
            verifyToken,
            this.transactionController.getAttendList
        );

        this.router.post(
            "/create-transaction",
            verifyToken,
            isCustomer,
            this.transactionController.createTransaction
        );

        this.router.get(
            "/transactions",
            verifyToken,
            this.transactionController.getUserTransactions
        );

        this.router.patch(
            "/:transactionId/upload-payment-proof",
            verifyToken,
            this.transactionController.uploadPaymentProof
        );

        this.router.get(
            "/:transactionId",
            verifyToken,
            this.transactionController.getTransactionDetail
        )

        this.router.patch(
            "/transactions/:transactionId/confirm",
            verifyToken,
            isOrganizer,
            this.transactionController.getTransactionDetail
        )

        this.router.patch(
            "/:transactionId/confirm",
            verifyToken,
            isOrganizer,
            this.transactionController.confirmTransaction
        );

        this.router.get(
            "/event/:eventId/statistics",
            verifyToken,
            isOrganizer,
            this.transactionController.getEventStatistic
        );
    }

    public getRouter(): Router {
        return this.router;
    }
}

export default TransactionRouter;
