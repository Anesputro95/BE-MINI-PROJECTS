import { prisma } from "../config/prisma";

export const createUserPoints = async (data: { userId: number, amount: number, expiredAt: Date }) => {
    return prisma.userPoint.create({ data })
}