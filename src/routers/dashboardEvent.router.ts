import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken";
import { isOrganizer } from "../middleware/isOrganizer";
import EventDashboardController from "../controllers/dashboardEvent.controller";


class EventDashboradRouter {
    private router: Router;
    private dashboardEventController: EventDashboardController;

    constructor() {
        this.router = Router();
        this.dashboardEventController = new EventDashboardController();
        this.initialRoute();
    }

    private initialRoute(): void {
        this.router.get("/events", verifyToken, isOrganizer, this.dashboardEventController.getEvents);
        this.router.post("/create-event", verifyToken, isOrganizer, this.dashboardEventController.createEvents)
    }

    public getRouter(): Router {
        return this.router;
    }
}

export default EventDashboradRouter;

