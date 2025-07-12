"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verifyToken_1 = require("../middleware/verifyToken");
const isOrganizer_1 = require("../middleware/isOrganizer");
const event_controller_1 = __importDefault(require("../controllers/event.controller"));
class EventRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.EventController = new event_controller_1.default();
        this.initialRoute();
    }
    initialRoute() {
        this.router.get("/events", verifyToken_1.verifyToken, this.EventController.getEvents);
        this.router.get("/public", this.EventController.getPublicEvents);
        this.router.get("/public/:id", this.EventController.getEventDetail);
        this.router.get("/events/:id", verifyToken_1.verifyToken, this.EventController.getEventByList);
        this.router.post("/create-event", verifyToken_1.verifyToken, isOrganizer_1.isOrganizer, this.EventController.createEvents);
        this.router.patch("/event/:id", verifyToken_1.verifyToken, isOrganizer_1.isOrganizer, this.EventController.updateEvent);
        this.router.delete("/event/:id", verifyToken_1.verifyToken, isOrganizer_1.isOrganizer, this.EventController.deleteEvent);
        this.router.get("/my", verifyToken_1.verifyToken, isOrganizer_1.isOrganizer, this.EventController.getMyEvent);
    }
    getRouter() {
        return this.router;
    }
}
exports.default = EventRouter;
