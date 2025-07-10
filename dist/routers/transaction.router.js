"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const transaction_controller_1 = __importDefault(require("../controllers/transaction.controller"));
const verifyToken_1 = require("../middleware/verifyToken");
const isOrganizer_1 = require("../middleware/isOrganizer");
const isCustomer_1 = require("../middleware/isCustomer");
class TransactionRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.transactionController = new transaction_controller_1.default();
        this.initialRoute();
    }
    initialRoute() {
        // 👥 Untuk admin/organizer melihat daftar attendee
        this.router.get("/attendees/:eventId", verifyToken_1.verifyToken, this.transactionController.getAttendList);
        // 🧾 Untuk user membuat transaksi pembelian tiket
        this.router.post("/create-transaction", verifyToken_1.verifyToken, isCustomer_1.isCustomer, this.transactionController.createTransaction);
        // 📜 Untuk user melihat daftar transaksi mereka
        this.router.get("/transactions", verifyToken_1.verifyToken, this.transactionController.getUserTransactions);
        this.router.patch("/:transactionId/upload-payment-proof", verifyToken_1.verifyToken, this.transactionController.uploadPaymentProof);
        this.router.get("/:transactionId", verifyToken_1.verifyToken, this.transactionController.getTransactionDetail);
        this.router.patch("/transactions/:transactionId/confirm", verifyToken_1.verifyToken, this.transactionController.getTransactionDetail);
        this.router.patch("/:transactionId/confirm", verifyToken_1.verifyToken, isOrganizer_1.isOrganizer, this.transactionController.confirmTransaction);
        this.router.get("/event/:eventId/statistics", verifyToken_1.verifyToken, isOrganizer_1.isOrganizer, this.transactionController.getEventStatistic);
    }
    getRouter() {
        return this.router;
    }
}
exports.default = TransactionRouter;
