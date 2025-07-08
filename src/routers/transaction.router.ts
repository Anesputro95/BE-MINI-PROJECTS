import { Router } from 'express';
import TransactionController from '../controllers/transaction.controller';
import { verifyToken } from '../middleware/verifyToken';

class TransactionRouter {
    private router: Router;
    private transactionController: TransactionController;

    constructor() {
        this.router = Router();
        this.transactionController = new TransactionController();
        this.initialRoute();
    }

    private initialRoute(): void {
        // 👥 Untuk admin/organizer melihat daftar attendee
        this.router.get(
            "/attendees/:eventId",
            verifyToken,
            this.transactionController.getAttendList
        );

        // 🧾 Untuk user membuat transaksi pembelian tiket
        this.router.post(
            "/create-transaction",
            verifyToken,
            this.transactionController.createTransaction
        );

        // 📜 Untuk user melihat daftar transaksi mereka
        this.router.get(
            "/transactions",
            verifyToken,
            this.transactionController.getUserTransactions
        );

        //  Untuk Organizer dapat melihat event yg di buat
        this.router.get(
            "/event-transaction/:eventId",
            verifyToken,
            this.transactionController.getEventTransactions
        )
    }

    public getRouter(): Router {
        return this.router;
    }
}

export default TransactionRouter;
