import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken";
import { isOrganizer } from "../middleware/isOrganizer";
import EventController from "../controllers/event.controller";


class EventRouter {
    private router: Router;
    private EventController: EventController;

    constructor() {
        this.router = Router();
        this.EventController = new EventController();
        this.initialRoute();
    }

    private initialRoute(): void {
        this.router.get("/events", verifyToken, this.EventController.getEvents);
        this.router.get("/public", this.EventController.getPublicEvents);
        this.router.get("/public/:id", this.EventController.getEventDetail)
        this.router.get("/events/:id", verifyToken, this.EventController.getEventByList)
        this.router.post("/create-event", verifyToken, isOrganizer, this.EventController.createEvents)
        this.router.patch("/event/:id", verifyToken, isOrganizer, this.EventController.updateEvent)
        this.router.delete("/event/:id", verifyToken, isOrganizer, this.EventController.deleteEvent)
        this.router.get(
            "/my",
            verifyToken,
            isOrganizer,
            this.EventController.getMyEvent
        );
        this.router.get(
            "/dashboard/summary",
            verifyToken,
            isOrganizer,
            this.EventController.getDasboardSummary
        )
    }

    public getRouter(): Router {
        return this.router;
    }
}

export default EventRouter;

