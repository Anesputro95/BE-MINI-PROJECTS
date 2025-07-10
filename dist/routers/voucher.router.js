"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const voucher_controller_1 = __importDefault(require("../controllers/voucher.controller"));
const verifyToken_1 = require("../middleware/verifyToken");
const isOrganizer_1 = require("../middleware/isOrganizer");
class VoucherRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.voucherController = new voucher_controller_1.default();
        this.initialRoutes();
    }
    initialRoutes() {
        this.router.post("/", verifyToken_1.verifyToken, isOrganizer_1.isOrganizer, this.voucherController.createVoucher);
        this.router.get("/:eventId", verifyToken_1.verifyToken, isOrganizer_1.isOrganizer, this.voucherController.getVouchersByEvent);
    }
    getRouter() {
        return this.router;
    }
}
exports.default = VoucherRouter;
