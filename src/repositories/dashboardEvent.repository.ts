import { prisma } from '../config/prisma'
import { EventCategory } from '../generated/prisma';

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
    thumbnail: string;
    category: EventCategory;
    salesStart?: Date;
    salesEnd?: Date;
    tickets: {
        name: string;
        price: number;
        quota: number;
    } [];
}

export const createEvent = async (input: CreateEventDTO) => {
    const { organizerId, title, description, thumbnail, category, salesStart, salesEnd, tickets } = input;

    return prisma.event.create({
        data: {
            organizerId,
            title,
            description,
            thumbnail,
            category,
            salesStart,
            salesEnd,
            tickets: {
                create: tickets.map(t => ({
                    name: t.name,
                    price: t.price,
                    quota: t.quota,
                }))
            }
        },
        include: {
            tickets: true,
        }
    });
};