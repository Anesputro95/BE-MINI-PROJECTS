import App from "../app";
import { prisma } from "../config/prisma";
import AppError from "../errors/AppError";
import { EventCategory } from "../generated/prisma";
import { createEvent, eventDashboard } from "../repositories/dashboardEvent.repository";

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
    } [];
}

export const getEventsService = async (organizerId: number) => {
    return await eventDashboard(organizerId)
};

export const createEventService = async (input: CreateEventInput) => {
    return await createEvent(input);
};