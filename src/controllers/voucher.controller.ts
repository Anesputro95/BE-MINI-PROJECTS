import {Request, Response, NextFunction} from "express";
import {
    createVoucherService,
    getVouchersByEventService,
} from "../services/voucher.service";
import { create } from "domain";
import { getVouchersByEvent } from "../repositories/voucher.repository";

class VoucherController {
    public async createVoucher(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const {id: organizerId} = res.locals.descript;

            const {
                eventId,
                code,
                discountAmount,
                discountPercent,
                maxDiscount,
                startDate,
                endDate,
                maxUsage,
            } = req.body;

            const voucher = await createVoucherService({
                eventId,
                code,
                discountAmount,
                discountPercent,
                maxDiscount,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                maxUsage,
                organizerId,
            });

            res.status(201).send({
                success: true,
                message: "Voucher created successfully",
                data: voucher,
            });
        } catch (error) {
            next (error);
        }
    }

    public async getVouchersByEvent(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try{
            const eventId = Number(req.params.eventId);

            const vouchers = await getVouchersByEventService(eventId);

            res.status(200).send({
                success: true,
                message: "Vouchers retrieved",
                data: vouchers,
            });
        } catch (error) {
        next (error);
        }
    }
}

export default VoucherController;