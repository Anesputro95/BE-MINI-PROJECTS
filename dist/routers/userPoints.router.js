"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userPoints_controller_1 = require("../controllers/userPoints.controller");
const verifyToken_1 = require("../middleware/verifyToken");
const router = (0, express_1.Router)();
const controller = new userPoints_controller_1.UserPointsController();
router.post("/redeem", verifyToken_1.verifyToken, controller.redeemPoints);
exports.default = router;
