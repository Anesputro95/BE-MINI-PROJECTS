import e, {Request, Response, NextFunction} from "express";
import { transactionService } from "../services/transaction.service";


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
                succes: true,
                data,
            })
        } catch (error) {
            next(error)
        }
    }
}

export default TransactionController;