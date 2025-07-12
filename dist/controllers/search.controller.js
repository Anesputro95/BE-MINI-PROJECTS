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
exports.searchController = void 0;
const search_service_1 = require("../services/search.service");
const searchController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = req.query.query;
        if (!query) {
            res.status(400).json({ success: false, message: "Missing query parameter." });
            return;
        }
        const results = yield (0, search_service_1.searchUsersService)(query);
        res.status(200).json({
            success: true,
            data: results,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.searchController = searchController;
