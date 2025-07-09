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

interface CreateEventInput {
    organizerId: number;
    title: string;
    description: string;
    thumbnail: string;
    category: EventCategory;
    location: string;
    salesStart?: Date;
    salesEnd?: Date;
    tickets: {
        name: string;
        price: number;
        quota: number;
    }[];
}

export interface UpdateEventDTO extends Partial<CreateEventInput> {
    id: number;
}

export const createEvent = async (input: CreateEventInput) => {
    const { organizerId, title, description, thumbnail, category, location, salesStart, salesEnd, tickets } = input;

    return prisma.event.create({
        data: {
            organizerId,
            title,
            description,
            thumbnail,
            category,
            location,
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

export const findEventById = async (eventId: number) => {
    return prisma.event.findUnique({
        where: { id: eventId },
    });
};

export const updateEvent = async (input: UpdateEventDTO) => {
    const { id, tickets, ...eventData } = input;

    return prisma.event.update({
        where: { id },
        data: {
            ...eventData,
            tickets: {
                deleteMany: {},
                create: tickets?.map(t => ({
                    name: t.name,
                    price: t.price,
                    quota: t.quota,
                }))
            }
        },
        include: { tickets: true }
    });
};

export const deleteEvent = async (id: number) => {
    await prisma.ticket.deleteMany({
        where: { eventId: id }
    });

    return await prisma.event.delete({
        where: { id }
    });
};

export const getEventByOragnizerId = async (organizerId: number) => {
    return prisma.event.findMany({
        where: { organizerId },
        select: {
            id: true,
            title: true,
            thumbnail: true,
            createdAt: true,
            tickets: {
                select: {
                    quota: true,
                    sold: true
                }
            }
        },
        orderBy: {
            createdAt: "desc",
        }
    })
}