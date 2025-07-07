import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken";
import TransactionController from "../controllers/transaction.controller";

const transactionRouter = Router();
const transactionController = new TransactionController();

transactionRouter.post(
    "/create-transaction",
    verifyToken,
    transactionController.createTransaction
);

transactionRouter.get(
    "/transactions",
    verifyToken,
    transactionController.getUserTransactions
);

export default transactionRouter;