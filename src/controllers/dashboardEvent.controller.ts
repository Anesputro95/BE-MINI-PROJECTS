import { Request, Response, NextFunction } from "express";
import { createEventService, getEventsService } from "../services/dashboardEvent.service";

class EventDashboardController {
    public async getEvents(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const { id: organizerId } = res.locals.descript;

            const events = await getEventsService(organizerId);

            res.status(200).send({
                success: true,
                message: "Fetched organizer events",
                data: events,
            });
        } catch (error) {
            next(error)
        }
    }

    public async createEvents(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const { id: organizerId } = res.locals.descript;
            const { title, description, thumbnail, category, salesStart, salesEnd, tickets } = req.body;

            const event = await createEventService({
                organizerId,
                title,
                description,
                thumbnail,
                category,
                salesStart,
                salesEnd,
                tickets,
            });

            res.status(201).send({
                success: true,
                message: "Event created successfully",
                data: event,
            });
        } catch (error) {
            next(error)
        }
    }
}

export default EventDashboardController;