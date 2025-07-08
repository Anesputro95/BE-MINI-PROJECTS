import App from "../app";
import { prisma } from "../config/prisma";
import AppError from "../errors/AppError";
import { EventCategory } from "../generated/prisma";
import { createEvent, deleteEvent, eventDashboard, findEventById, updateEvent } from "../repositories/event.repository";


interface CreateEventInput {
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
    }[];
}

export interface UpdateEventDTO extends Partial<CreateEventInput> {
    id: number;
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
