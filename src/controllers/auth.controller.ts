import { NextFunction, Request, Response } from "express";
import AppError from "../errors/AppError";
import { prisma } from "../config/prisma";
import { hashPassword } from "../utils/hash";
import { transport } from "../config/nodemailer";
import { compare } from "bcrypt";
import { sign } from "jsonwebtoken";
import { loginService, regisService } from "../services/auth.service";

class AuthAccountController {
    public async register(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            await regisService(req.body)
            res.status(201).send({
                success: true,
                message: "Account created successfully. Please verify your email.",
            })

        } catch (error) {
            next(error)
        }
    }

    public async login(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const loginAccount = await loginService(req.body)
            res.status(200).send({
                message: "Login Success",
                email: loginAccount.account.email,
                imgProfile: loginAccount.account.ImgProfile,
                role: loginAccount.account.role,
                referral_code: loginAccount.account.referall_code,
                token: loginAccount.token,
            });

        } catch (error) {
            next(error)
        }
    }
}

export default AuthAccountController;