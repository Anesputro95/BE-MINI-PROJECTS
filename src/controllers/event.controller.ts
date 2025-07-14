import { Request, Response, NextFunction } from "express";
import {
    createEventService,
    deleteEventService,
    getEventsService,
    getMyEventsService,
    updateEventService,
    getPublicEventsService,
    getEventDetailService,
    getOrganizerDashboardService,
    getEventAttendeesService,
} from "../services/event.service";
import AppError from "../errors/AppError";
import { cloudinaryUpload } from "../config/cloudinary";

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
            const { title, description, thumbnail, category, salesStart, salesEnd, tickets, location } = req.body;

            if (!description || description.length < 10 || description.length > 300) {
                throw new AppError("Description must be between 10 and 300 characters", 400);
            }

            let uploadThumbnailURL = "";
            if (req.file) {
                const result = await cloudinaryUpload(req.file)
                uploadThumbnailURL = result.secure_url;
            } else {
                throw new AppError("Thumbnail image is required", 400)
            }
            console.log("Received file:", req.file);


            const parsedTickets = typeof tickets === "string" ? JSON.parse(tickets) : tickets;

            const event = await createEventService({
                organizerId,
                title,
                description,
                thumbnail: uploadThumbnailURL,
                category,
                salesStart: salesStart ? new Date(salesStart) : undefined,
                salesEnd: salesEnd ? new Date(salesEnd) : undefined,
                location,
                tickets: parsedTickets,
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

    public async getPublicEvents(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { category, location, keyword } = req.query;

            const events = await getPublicEventsService({
                category: category as string,
                location: location as string,
                keyword: keyword as string,
            });

            res.status(200).send({
                success: true,
                message: "Public events retrieved",
                data: events,
            });
        } catch (error) {
            next(error);
        }
    }

    public async getEventDetail(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const id = parseInt(req.params.id);

            const event = await getEventDetailService(id);

            res.status(200).send({
                success: true,
                message: "Event detail fetched successfully",
                data: event,
            });
        } catch (error) {
            next(error);
        }
    }

    public async getDasboardSummary(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const { id: organizerId } = res.locals.descript;

            const summary = await getOrganizerDashboardService(organizerId)

            res.status(200).json({
                success: true,
                message: "Dashboard summary retrieved",
                data: summary
            })
        } catch (error) {
            next(error)
        }
    }

    public async getAttendees(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const eventId = parseInt(req.params.id);
            const { id: organizerId } = res.locals.descript;

            const attendees = await getEventAttendeesService(eventId, organizerId);

            res.status(200).json({
                success: true,
                message: "Attendees retrieved successfully",
                data: attendees,
            });
        } catch (error) {
            next(error);
        }
    }

}

export default EventController;