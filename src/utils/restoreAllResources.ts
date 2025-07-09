import { prisma } from "../config/prisma";

export const restoreAllResources = async (trx: any) => {
    const operations = [];

    // kembalikan kursi tiket
    operations.push(
        prisma.ticket.update({
            where: { id: trx.ticketId },
            data: {
                sold: {
                    decrement: trx.ticketQuantity,
                },
            },
        })
    );

    //  Kembalikan kupon jika ada
    if (trx.usedCouponsId) {
        operations.push(
            prisma.coupon.update({
                where: { id: trx.usedCouponsId },
                data: { isUsed: false },
            })
        );
    }

    // Tambahkan kembali user point (jika sebelumnya digunakan)
    if (trx.userPoints && trx.userPoints > 0) {
        operations.push(
            prisma.userPoint.create({
                data: {
                    userId: trx.user.id,
                    amount: trx.userPoints,
                    expiredAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                }
            })
        );
    }
}