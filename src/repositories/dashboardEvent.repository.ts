import { prisma } from '../config/prisma'

export const eventDashboard = async (organizerId: number) => {
    return prisma.event.findMany({
        where: { organizerId },
        orderBy: { createdAt: "desc" },
        include: {
            transaction: {
                select: {
                    id: true,
                    status: true,
                    totalPrice: true,
                    ticketQuantity: true,
                }
            }
        }
    });
}

interface CreateEventDTO {
    organizerId: number;
    title: string;
    description: string;
    seatQuota: number;
    thumbnail: string;
}

export const createEvent = async (input: CreateEventDTO) => {
    const { organizerId, title, description, seatQuota, thumbnail } = input;

    return prisma.event.create({
        data: {
            organizerId,
            title,
            description,
            seatQuota,
            availableSeat: seatQuota,
            thumbnail,
        },
    });
};