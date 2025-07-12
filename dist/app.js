"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const search_router_1 = __importDefault(require("./routers/search.router"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_router_1 = __importDefault(require("./routers/auth.router"));
const logger_1 = __importDefault(require("./utils/logger"));
const transaction_router_1 = __importDefault(require("./routers/transaction.router"));
const event_router_1 = __importDefault(require("./routers/event.router"));
const voucher_router_1 = __importDefault(require("./routers/voucher.router"));
// import UserPointsRouter from './routers/userPoints.router';
const PORT = process.env.PORT || "8080";
class App {
    constructor() {
        this.app = (0, express_1.default)();
        this.configure();
        this.routes();
        this.errorHandler();
    }
    configure() {
        this.app.use((0, cors_1.default)());
        this.app.use(express_1.default.json());
    }
    routes() {
        const authRouter = new auth_router_1.default();
        const eventRouter = new event_router_1.default();
        const transactionRouter = new transaction_router_1.default();
        const voucherRouter = new voucher_router_1.default();
        // const userPointsRouter = UserPointsRouter;
        this.app.get('/', (req, res) => {
            res.status(200).json("<h1>Welcome to Mini Project</h1>");
        });
        this.app.use("/auth", authRouter.getRouter());
        this.app.use('/api', search_router_1.default);
        this.app.use('/event', eventRouter.getRouter());
        this.app.use('/transactions', transactionRouter.getRouter());
        this.app.use("/vouchers", voucherRouter.getRouter());
        // this.app?.use("/user-points", userPointsRouter);
    }
    errorHandler() {
        this.app.use((error, req, res, next) => {
            logger_1.default.error(`${req.method} ${req.path}: ${error.message} ${JSON.stringify(error)}`);
            res.status(error.statusCode || 500).json({
                success: false,
                error: error.message || "Internal Server Error"
            });
        });
    }
    start() {
        this.app.listen(PORT, () => {
            console.log(`Server is Running on http://localhost:${PORT}`);
        });
    }
}
exports.default = App;
