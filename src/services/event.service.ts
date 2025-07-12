import App from "../app";
import { prisma } from "../config/prisma";
import AppError from "../errors/AppError";
import { EventCategory } from "../generated/prisma";
import { createEvent, deleteEvent, eventDashboard, findEventById, getEventByOragnizerId, updateEvent } from "../repositories/event.repository";


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

export const getPublicEventsService = async (filters: {
    category?: string;
    location?: string;
    keyword?: string;
}) => {
    const whereClause: any = {};

    if (filters.category && filters.category.trim()) {
        whereClause.category = filters.category.trim();
    }

    if (filters.location && filters.location.trim()) {
        whereClause.location = { 
            contains: filters.location.trim(), 
            mode: "insensitive", 
        };
    }

    if (filters.keyword && filters.keyword.trim()) {
        whereClause.OR = [
            {title: { contains: filters.keyword.trim(), mode: "insensitive"}},
            {description: {contains: filters.keyword.trim(), mode: "insensitive"}}
        ];
    }

    return prisma.event.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            title: true,
            description: true,
            thumbnail: true,
            category: true,
            location: true,
            salesStart: true,
            createdAt: true,
            tickets: {
                select:{
                    id: true,
                    name: true,
                    price: true,
                    quota: true,
                    sold: true,
                }
            }
        },
    });
};

export const getEventDetailService = async (eventId: number) => {
    const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
            tickets: true,
            voucher: {
                where: {
                    endDate: { gte: new Date() },
                },
            },
            organizer: {
                select: {
                    id: true,
                    username: true,
                    email: true,
                }
            }
        },
    });

    if (!event) {
        throw new AppError("Event not found", 404);
    }

    return event;
}

export const getEventsService = async (organizerId: number) => {
    return await eventDashboard(organizerId);
};

export const createEventService = async (input: CreateEventInput) => {
    return await createEvent(input);
};

export const getEventByListService = async (id: number) => {
    return await findEventById(id);
}

export const updateEventService = async (input: UpdateEventDTO) => {
    return await updateEvent(input);
};

export const deleteEventService = async (id: number) => {
    return await deleteEvent(id)
}

export const getMyEventsService = async (organizerId: number) => {
    const events = await getEventByOragnizerId(organizerId);

    return events.map((event) => {
        const totalQuota = event.tickets.reduce((sum, t) => sum + t.quota, 0);
        const totalSold = event.tickets.reduce((sum, t) => sum + t.sold, 0);
        const availableSeat = totalQuota - totalSold;

        return {
            id: event.id,
            title: event.title,
            thumbnail: event.thumbnail,
            createdAt: event.createdAt,
            totalQuota,
            availableSeat,
        };
    });
}

export const getOrganizerDashboardService = async (organizerId: number) => {
    const events = await eventDashboard(organizerId);

    let totalTransaction = 0;
    let totalRevenue = 0;
    let totalTicketSold = 0;

    events.forEach(event => {
        event.transaction.forEach(trx => {
            if (trx.status === "DONE") {
                totalTransaction++;
                totalRevenue += Number(trx.totalPrice);
                totalTicketSold += trx.ticketQuantity;
            }
        });
    });
}
