import { prisma } from "../config/prisma";

export const createUserPoints = async (data: { userId: number, amount: number, expiredAt: Date }) => {
    return prisma.userPoint.create({ data })
};

export const getActiveUserPoints = async (userId: number) => {
    return prisma.userPoint.findMany({
        where: {
            userId,
            expiredAt: {gt: new Date()},
            amount: {gt:0}
        },
        orderBy: {expiredAt: "asc"}
    });
};

export const updateUserPointAmount = async (id: number, amount: number) => {
    return prisma.userPoint.update({
        where: {id},
        data: {amount}
    });
};