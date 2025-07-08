import { prisma } from "../config/prisma";


export const autoExpiredAndCancelTransactions = async () => {
    const now = new Date();

    await prisma.transaction.updateMany({
        where: {
            status: "WAITING_PAYMENT",
            createdAt: {lte: new Date(now.getTime() - 2 * 60 * 60 * 1000)},
        },
        data: {status: "EXPIRED"},
    });

    await prisma.transaction.updateMany({
        where: {
            status: "WAITING_CONFIRMATION",
            paymentProofUploadedAt: {
                lte: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
            },
        },
        data: {status: "CANCELED"},
    });

    const expiredOrCanceled = await prisma.transaction.findMany({
        where: {
            status: {in: ["EXPIRED", "CANCELED"]},
            restored: false,
        },
    });

    for (const trx of expiredOrCanceled) {
        await prisma.ticket.update({
            where: {id: trx.ticketId},
            data: {sold: {decrement: trx.ticketQuantity}},
        });

        if (trx.userPoints && trx. userPoints > 0) {
            await prisma.userPoint.create({
                data: {
                    userId: trx.userId,
                    amount: trx. userPoints,
                    expiredAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
                },
            });
        }

        await prisma.transaction.update({
            where: {id: trx.id},
            data: {restored: true},
        });
    }
};