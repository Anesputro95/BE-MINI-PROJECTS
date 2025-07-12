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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyEventsService = exports.deleteEventService = exports.updateEventService = exports.getEventByListService = exports.createEventService = exports.getEventsService = exports.getEventDetailService = exports.getPublicEventsService = void 0;
const prisma_1 = require("../config/prisma");
const AppError_1 = __importDefault(require("../errors/AppError"));
const event_repository_1 = require("../repositories/event.repository");
const getPublicEventsService = (filters) => __awaiter(void 0, void 0, void 0, function* () {
    const whereClause = {};
    if (filters.category) {
        whereClause.category = filters.category;
    }
    if (filters.location) {
        whereClause.location = { contains: filters.location, mode: "insensitive" };
    }
    return prisma_1.prisma.event.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            title: true,
            description: true,
            thumbnail: true,
            category: true,
            location: true,
            createdAt: true,
        },
    });
});
exports.getPublicEventsService = getPublicEventsService;
const getEventDetailService = (eventId) => __awaiter(void 0, void 0, void 0, function* () {
    const event = yield prisma_1.prisma.event.findUnique({
        where: { id: eventId },
        include: {
            tickets: true,
            voucher: {
                where: {
                    endDate: { gte: new Date() },
                },
            },
            organizer: {
                select: {
                    id: true,
                    username: true,
                    email: true,
                }
            }
        },
    });
    if (!event) {
        throw new AppError_1.default("Event not found", 404);
    }
    return event;
});
exports.getEventDetailService = getEventDetailService;
const getEventsService = (organizerId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, event_repository_1.eventDashboard)(organizerId);
});
exports.getEventsService = getEventsService;
const createEventService = (input) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, event_repository_1.createEvent)(input);
});
exports.createEventService = createEventService;
const getEventByListService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, event_repository_1.findEventById)(id);
});
exports.getEventByListService = getEventByListService;
const updateEventService = (input) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, event_repository_1.updateEvent)(input);
});
exports.updateEventService = updateEventService;
const deleteEventService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, event_repository_1.deleteEvent)(id);
});
exports.deleteEventService = deleteEventService;
const getMyEventsService = (organizerId) => __awaiter(void 0, void 0, void 0, function* () {
    const events = yield (0, event_repository_1.getEventByOragnizerId)(organizerId);
    return events.map((event) => {
        const totalQuota = event.tickets.reduce((sum, t) => sum + t.quota, 0);
        const totalSold = event.tickets.reduce((sum, t) => sum + t.sold, 0);
        const availableSeat = totalQuota - totalSold;
        return {
            id: event.id,
            title: event.title,
            thumbnail: event.thumbnail,
            createdAt: event.createdAt,
            totalQuota,
            availableSeat,
        };
    });
});
exports.getMyEventsService = getMyEventsService;
