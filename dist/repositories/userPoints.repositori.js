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
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserPointAmount = exports.getActiveUserPoints = exports.createUserPoints = void 0;
const prisma_1 = require("../config/prisma");
const createUserPoints = (data) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.prisma.userPoint.create({ data });
});
exports.createUserPoints = createUserPoints;
const getActiveUserPoints = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.prisma.userPoint.findMany({
        where: {
            userId,
            expiredAt: { gt: new Date() },
            amount: { gt: 0 }
        },
        orderBy: { expiredAt: "asc" }
    });
});
exports.getActiveUserPoints = getActiveUserPoints;
const updateUserPointAmount = (id, amount) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.prisma.userPoint.update({
        where: { id },
        data: { amount }
    });
});
exports.updateUserPointAmount = updateUserPointAmount;
