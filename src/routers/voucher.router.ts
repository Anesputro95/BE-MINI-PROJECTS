import { Router } from "express";
import VoucherController from "../controllers/voucher.controller";
import { verifyToken } from "../middleware/verifyToken";
import { isOrganizer } from "../middleware/isOrganizer";
import { isCustomer } from "../middleware/isCustomer";

class VoucherRouter {
    private router: Router;
    private voucherController: VoucherController;

    constructor() {
        this.router = Router();
        this.voucherController = new VoucherController();
        this.initialRoutes();
    }

    private initialRoutes(): void {
        this.router.post(
            "/",
            verifyToken,
            isOrganizer,
            this.voucherController.createVoucher
        );

        this.router.get(
            "/my-coupon",
            verifyToken,
            isCustomer,
            this.voucherController.getMyCoupons
        )

        this.router.get(
            "/:eventId",
            verifyToken,
            isOrganizer,
            this.voucherController.getVouchersByEvent
        );

    }

    public getRouter(): Router {
        return this.router;
    }
}

export default VoucherRouter;
