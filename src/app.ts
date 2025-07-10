import dotenv from 'dotenv';
dotenv.config();

import searchRouter from './routers/search.router';
import express, { Application, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import AuthAccountRouter from './routers/auth.router';
import logger from './utils/logger';
import TransactionRouter from './routers/transaction.router';
import EventRouter from './routers/event.router';
import VoucherRouter from './routers/voucher.router';
// import UserPointsRouter from './routers/userPoints.router';

const PORT = process.env.PORT || "8080";

class App {
    public app: Application ;

    constructor() {
        this.app = express();
        this.configure();
        this.routes();
        this.errorHandler();
    }

    private configure(): void {
        this.app.use(cors());
        this.app.use(express.json());
    }

    private routes(): void {
        const authRouter = new AuthAccountRouter();
        const eventRouter = new EventRouter();
        const transactionRouter = new TransactionRouter();
        const voucherRouter = new VoucherRouter();
        // const userPointsRouter = UserPointsRouter;

        this.app.get('/', (req: Request, res: Response) => {
            res.status(200).json("<h1>Welcome to Mini Project</h1>")
        });

        this.app.use("/auth", authRouter.getRouter());
        this.app.use('/api', searchRouter);
        this.app.use('/event', eventRouter.getRouter());
        this.app.use('/transactions', transactionRouter.getRouter());
        this.app.use("/vouchers", voucherRouter.getRouter());
        // this.app?.use("/user-points", userPointsRouter);

    }

    private errorHandler(): void {
        this.app.use((error: any, req: Request, res: Response, next: NextFunction) => {
            logger.error(
                `${req.method} ${req.path}: ${error.message} ${JSON.stringify(error)}`
            );
            res.status(error.statusCode || 500).json({
                success: false,
                error: error.message || "Internal Server Error"
            });
        });
    }

    public start(): void {
        this.app.listen(PORT, () => {
            console.log(`Server is Running on http://localhost:${PORT}`);
        });
    }
}

export default App;
