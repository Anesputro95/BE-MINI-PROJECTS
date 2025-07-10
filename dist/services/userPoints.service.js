"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.consumeUserPoints = void 0;
const userPoints_repositori_1 = require("../repositories/userPoints.repositori");
const AppError_1 = __importDefault(require("../errors/AppError"));
const consumeUserPoints = (userId, pointsToUse) => __awaiter(void 0, void 0, void 0, function* () {
    const activePoints = yield (0, userPoints_repositori_1.getActiveUserPoints)(userId);
    const totalAvailable = activePoints.reduce((sum, p) => sum + p.amount, 0);
    if (pointsToUse > totalAvailable) {
        throw new AppError_1.default("Not enough points", 400);
    }
    let remaining = pointsToUse;
    for (const point of activePoints) {
        if (remaining <= 0)
            break;
        if (point.amount >= remaining) {
            yield (0, userPoints_repositori_1.updateUserPointAmount)(point.id, point.amount - remaining);
            remaining = 0;
        }
        else {
            yield (0, userPoints_repositori_1.updateUserPointAmount)(point.id, 0);
            remaining -= point.amount;
        }
    }
});
exports.consumeUserPoints = consumeUserPoints;
