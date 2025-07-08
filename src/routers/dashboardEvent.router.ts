import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken";
import { isOrganizer } from "../middleware/isOrganizer";
import EventDashboardController from "../controllers/dashboardEvent.controller";


class EventDashboardRouter {
    private router: Router;
    private dashboardEventController: EventDashboardController;

    constructor() {
        this.router = Router();
        this.dashboardEventController = new EventDashboardController();
        this.initialRoute();
    }

    private initialRoute(): void {
        this.router.get("/events", verifyToken, this.dashboardEventController.getEvents);
        this.router.get("/events/:id", verifyToken,this.dashboardEventController.getEventByList)
        this.router.post("/create-event", verifyToken, isOrganizer, this.dashboardEventController.createEvents)
        this.router.patch("/event/:id", verifyToken, isOrganizer, this.dashboardEventController.updateEvent)
        this.router.delete("/event/:id", verifyToken, isOrganizer, this.dashboardEventController.deleteEvent)
    }

    public getRouter(): Router {
        return this.router;
    }
}

export default EventDashboardRouter;

