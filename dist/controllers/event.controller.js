"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const event_service_1 = require("../services/event.service");
class EventController {
    getEvents(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id: customerId } = res.locals.descript;
                const events = yield (0, event_service_1.getEventsService)(customerId);
                res.status(200).send({
                    success: true,
                    message: "Fetched organizer events",
                    data: events,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    createEvents(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id: organizerId } = res.locals.descript;
                const { title, description, thumbnail, category, salesStart, salesEnd, tickets, location } = req.body;
                const event = yield (0, event_service_1.createEventService)({
                    organizerId,
                    title,
                    description,
                    thumbnail,
                    category,
                    salesStart,
                    salesEnd,
                    location,
                    tickets,
                });
                res.status(201).send({
                    success: true,
                    message: "Event created successfully",
                    data: event,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getEventByList(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(req.params.id);
                const getEvent = yield (0, event_service_1.getEventsService)(id);
                res.status(200).send({
                    success: true,
                    message: "the event was successfully obtained",
                    data: getEvent
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    updateEvent(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(req.params.id);
                const input = Object.assign({ id }, req.body);
                const updatedEvent = yield (0, event_service_1.updateEventService)(input);
                res.status(200).json({
                    success: true,
                    message: 'Event updated successfully',
                    data: updatedEvent,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    ;
    deleteEvent(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(req.params.id);
                yield (0, event_service_1.deleteEventService)(id);
                res.status(200).send({
                    success: true,
                    message: "Event successfully deleted"
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getMyEvent(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id: organizerId } = res.locals.descript;
                const events = yield (0, event_service_1.getMyEventsService)(organizerId);
                res.status(200).send({
                    success: true,
                    message: "Your events retrieved successfully",
                    data: events,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getPublicEvents(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { category, location } = req.query;
                const events = yield (0, event_service_1.getPublicEventsService)({
                    category: category,
                    location: location,
                });
                res.status(200).send({
                    success: true,
                    message: "Public events retrieved",
                    data: events,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getEventDetail(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(req.params.id);
                const event = yield (0, event_service_1.getEventDetailService)(id);
                res.status(200).send({
                    success: true,
                    message: "Event detail fetched successfully",
                    data: event,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = EventController;
