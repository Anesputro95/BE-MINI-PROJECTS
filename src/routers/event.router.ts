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
    }

    public getRouter(): Router {
        return this.router;
    }
}

export default EventRouter;

