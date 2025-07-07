import { prisma } from "../config/prisma";

export const TransactionsStatus = async (eventId: number) => {
    return prisma.transaction.findMany({
        where: {
            eventId,
            status: "ACCEPTED"
        },
        select: {
            ticketQuantity: true,
            totalPrice: true,
            user: {
                select: {
                    username: true,
                    email: true,
                }
            }
        }
    });
}

// export const getTransactionById = async (id: number) => {
//     return prisma.transaction.findUnique({
//         where: { id },
//         include: {
//             user: true,
//             event: true,
//         }
//     })
// }

