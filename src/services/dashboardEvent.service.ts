import App from "../app";
import { prisma } from "../config/prisma";
import AppError from "../errors/AppError";
import { createEvent, eventDashboard } from "../repositories/dashboardEvent.repository";

interface CreateEventInput {
    organizerId: number;
    title: string;
    description: string;
    seatQuota: number;
    thumbnail: string;
}

export const getEventsService = async (organizerId: number) => {
    return await eventDashboard(organizerId)
}

export const createEventService = async (input: CreateEventInput) => {
    return await createEvent(input);
}
