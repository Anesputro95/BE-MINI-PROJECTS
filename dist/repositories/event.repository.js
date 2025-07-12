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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEventByOragnizerId = exports.deleteEvent = exports.updateEvent = exports.findEventById = exports.createEvent = exports.eventDashboard = void 0;
const prisma_1 = require("../config/prisma");
const eventDashboard = (organizerId) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.prisma.event.findMany({
        where: { organizerId },
        orderBy: { createdAt: "desc" },
        include: {
            transaction: {
                select: {
                    id: true,
                    status: true,
                    totalPrice: true,
                    ticketQuantity: true,
                }
            }
        }
    });
});
exports.eventDashboard = eventDashboard;
const createEvent = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const { organizerId, title, description, thumbnail, category, location, salesStart, salesEnd, tickets } = input;
    return prisma_1.prisma.event.create({
        data: {
            organizerId,
            title,
            description,
            thumbnail,
            category,
            location,
            salesStart,
            salesEnd,
            tickets: {
                create: tickets.map(t => ({
                    name: t.name,
                    price: t.price,
                    quota: t.quota,
                }))
            }
        },
        include: {
            tickets: true,
        }
    });
});
exports.createEvent = createEvent;
const findEventById = (eventId) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.prisma.event.findUnique({
        where: { id: eventId },
    });
});
exports.findEventById = findEventById;
const updateEvent = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, tickets } = input, eventData = __rest(input, ["id", "tickets"]);
    return prisma_1.prisma.event.update({
        where: { id },
        data: Object.assign(Object.assign({}, eventData), { tickets: {
                deleteMany: {},
                create: tickets === null || tickets === void 0 ? void 0 : tickets.map(t => ({
                    name: t.name,
                    price: t.price,
                    quota: t.quota,
                }))
            } }),
        include: { tickets: true }
    });
});
exports.updateEvent = updateEvent;
const deleteEvent = (id) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.prisma.ticket.deleteMany({
        where: { eventId: id }
    });
    return yield prisma_1.prisma.event.delete({
        where: { id }
    });
});
exports.deleteEvent = deleteEvent;
const getEventByOragnizerId = (organizerId) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.prisma.event.findMany({
        where: { organizerId },
        select: {
            id: true,
            title: true,
            thumbnail: true,
            createdAt: true,
            tickets: {
                select: {
                    quota: true,
                    sold: true
                }
            }
        },
        orderBy: {
            createdAt: "desc",
        }
    });
});
exports.getEventByOragnizerId = getEventByOragnizerId;
