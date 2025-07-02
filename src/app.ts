import searchRouter from './routers/search.router';
import dotenv from 'dotenv';

dotenv.config();

import express, { Application, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import AuthAccountRouter from './routers/auth.router';
import logger from './utils/logger';


const PORT = process.env.PORT || "8080";

class App {
    public app: Application | undefined;

    constructor() {
        this.app = express();
        this.configure();
        this.routes();
        this.errorHandler();
    }
    private configure(): void {
        this.app?.use(cors());
        this.app?.use(express.json());
    }

    private routes(): void {
        const authRouter = new AuthAccountRouter();
        this.app?.use("/auth", authRouter.getRouter());
        this.app?.use('/api', searchRouter);
        this.app?.get('/', (req: Request, res: Response) => {
            res.status(200).send("<h1>Welcome to Mini Project</h1>")
        })
    }

    private errorHandler(): void {
        this.app?.use((error: any, req: Request, res: Response, next: NextFunction) => {
            logger.error(
                `${req.method} ${req.path}: ${error.message} ${JSON.stringify(error)}`
            );
            res.status(error.rc || 500).send(error)
        })
    }

    public start(): void {
        this.app?.listen(PORT, () => {
            console.log(`Server is Running on http://localhost:${PORT}`);
        })
    }
}

export default App;