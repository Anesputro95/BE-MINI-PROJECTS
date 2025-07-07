
import { Router } from 'express';
import TransactionController from '../controllers/transaction.controller';

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
            this.transactionController.getAttendList
        );
    }

    public getRouter(): Router {
        return this.router;
      }
}

export default TransactionRouter;