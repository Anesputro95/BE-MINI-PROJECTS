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
        var _a, _b;
        (_a = this.app) === null || _a === void 0 ? void 0 : _a.use((0, cors_1.default)({
            origin: "http://localhost:3000",
            credentials: true
        }));
        (_b = this.app) === null || _b === void 0 ? void 0 : _b.use(express_1.default.json());
    }
    routes() {
        var _a, _b, _c, _d, _e, _f;
        const authRouter = new auth_router_1.default();
        const eventRouter = new event_router_1.default();
        const transactionRouter = new transaction_router_1.default();
        const voucherRouter = new voucher_router_1.default();
        // const userPointsRouter = UserPointsRouter;
        (_a = this.app) === null || _a === void 0 ? void 0 : _a.use("/auth", authRouter.getRouter());
        (_b = this.app) === null || _b === void 0 ? void 0 : _b.use('/api', search_router_1.default);
        (_c = this.app) === null || _c === void 0 ? void 0 : _c.use('/event', eventRouter.getRouter());
        (_d = this.app) === null || _d === void 0 ? void 0 : _d.use('/transactions', transactionRouter.getRouter());
        (_e = this.app) === null || _e === void 0 ? void 0 : _e.use("/vouchers", voucherRouter.getRouter());
        // this.app?.use("/user-points", userPointsRouter);
        (_f = this.app) === null || _f === void 0 ? void 0 : _f.get('/', (req, res) => {
            res.status(200).json("<h1>Welcome to Mini Project</h1>");
        });
    }
    errorHandler() {
        var _a;
        (_a = this.app) === null || _a === void 0 ? void 0 : _a.use((error, req, res, next) => {
            logger_1.default.error(`${req.method} ${req.path}: ${error.message} ${JSON.stringify(error)}`);
            res.status(error.statusCode || 500).json({
                success: false,
                error: error.message || "Internal Server Error"
            });
        });
    }
    start() {
        var _a;
        (_a = this.app) === null || _a === void 0 ? void 0 : _a.listen(PORT, () => {
            console.log(`Server is Running on http://localhost:${PORT}`);
        });
    }
}
exports.default = App;
