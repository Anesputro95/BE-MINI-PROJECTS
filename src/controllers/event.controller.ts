import { Request, Response, NextFunction } from "express";
import { createEventService, deleteEventService, getEventsService, getMyEventsService, updateEventService } from "../services/event.service";

class EventController {
    public async getEvents(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const { id: customerId } = res.locals.descript;

            const events = await getEventsService(customerId);

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

    public async getEventByList(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const id = parseInt(req.params.id);

            const getEvent = await getEventsService(id);

            res.status(200).send({
                success: true,
                message: "the event was successfully obtained",
                data: getEvent
            })
        } catch (error) {
            next(error)
        }
    }

    public async updateEvent(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const input = {
                id,
                ...req.body,
            };

            const updatedEvent = await updateEventService(input);

            res.status(200).json({
                success: true,
                message: 'Event updated successfully',
                data: updatedEvent,
            });
        } catch (error) {
            next(error);
        }
    };

    public async deleteEvent(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const id = parseInt(req.params.id);

            await deleteEventService(id)

            res.status(200).send({
                success: true,
                message: "Event successfully deleted"
            })
        } catch (error) {
            next(error)
        }
    }

    public async getMyEvent(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { id: organizerId } = res.locals.descript;

            const events = await getMyEventsService(organizerId);

            res.status(200).send({
                success: true,
                message: "Your events retrieved successfully",
                data: events,
            });
        } catch (error) {
            next(error)
        }
    }
}

export default EventController;