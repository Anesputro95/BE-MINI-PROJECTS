import { NextFunction, Request, Response } from "express";
import AppError from "../errors/AppError";
import { prisma } from "../config/prisma";
import { hashPassword } from "../utils/hash";
import { transport } from "../config/nodemailer";
import { compare } from "bcrypt";
import { sign } from "jsonwebtoken";

class AuthAccountController {
    public async register(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const exitingUser = await prisma.account.findUnique({
                where: {
                    email: req.body.email,
                }
            })
            if (exitingUser) {
                throw new AppError("Email already registered:", 400);
            }

            let referedBy = null;
            const referralCode = req.body.referralCode;
            if (referralCode) {
                const referrer = await prisma.account.findUnique({
                    where: { referall_code: referralCode }
                });

                if (!referrer) {
                    throw new AppError("Invalid referral code", 400);
                }
                referedBy = referralCode
            }

            let referralCodeNew = "";
            let isUnique = false;
            while (!isUnique) {
                const code = `${req.body.username}-${Math.random().toString(36).substring(2, 8)}`;
                const existingCode = await prisma.account.findUnique({
                    where: { referall_code: code },
                });
                if (!existingCode) {
                    referralCodeNew = code;
                    isUnique = true;
                }
            }
            const newAccount = await prisma.account.create({
                data: {
                    username: req.body.username,
                    email: req.body.email,
                    password: await hashPassword(req.body.password),
                    role: req.body.role || "CUSTOMER",
                    isVeriefied: false,
                    referall_code: referralCodeNew,
                    referred_by: referedBy,
                }
            })

            await transport.sendMail({
                from: process.env.MAILSENDER,
                to: newAccount.email,
                subject: "Verify Your Account - Event App",
                html: `
                <!DOCTYPE html>
                <html>
                  <head>
                    <style>
                      .container {
                        max-width: 600px;
                        margin: auto;
                        font-family: Arial, sans-serif;
                        border: 1px solid #e0e0e0;
                        border-radius: 8px;
                        padding: 24px;
                        background-color: #f9f9f9;
                      }
                      .btn {
                        display: inline-block;
                        margin-top: 20px;
                        padding: 12px 24px;
                        background-color: #007bff;
                        color: white;
                        text-decoration: none;
                        border-radius: 4px;
                      }
                      .footer {
                        font-size: 12px;
                        color: #888;
                        margin-top: 30px;
                      }
                    </style>
                  </head>
                  <body>
                    <div class="container">
                      <h2 style="color:#333;">Welcome to Event App, ${newAccount.username}!</h2>
                      <p>Thank you for registering your account.</p>
                      <p>To complete your registration, please verify your email by clicking the button below:</p>
              
                      <a href="" class="btn">Verify My Account</a>
              
                      <p>If the button above doesn't work, copy and paste the following link into your browser:</p>
                      <p style="word-break: break-all;">https://yourdomain.com/verify/${newAccount.id}</p>
              
                      <div class="footer">
                        <p>This email was sent by Event App. If you did not sign up, please ignore this message.</p>
                      </div>
                    </div>
                  </body>
                </html>
                `,
            });


            res.status(201).send({
                success: true,
                message: "Account created successfully. Please verify your email.",
                data: {
                    id: newAccount.id,
                    username: newAccount.username,
                    email: newAccount.email,
                    role: newAccount.role,
                    referral_code: newAccount.referall_code,
                }
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
            const findUser = await prisma.account.findUnique({
                where: {
                    email: req.body.email,
                }
            });

            if (!findUser) {
                throw new AppError("Email not registered", 404);
            }

            if (!findUser.isVeriefied) {
                throw new AppError("Please verify your email", 403);
            }

            const comparePass = await compare(req.body.password, findUser.password);
            if (!comparePass) {
                throw new AppError("Password is wrong", 401);
            }

            const token = sign(
                { id: findUser.id, role: findUser.role },
                process.env.TOKEN_KEY || "secret",
                { expiresIn: "1d" }
            );

            res.status(200).send({
                message: "Login Success",
                email: findUser.email,
                imgProfile: findUser.ImgProfile,
                role: findUser.role,
                referral_code: findUser.referall_code,
                token,
            });

        } catch (error) {
            next(error)
        }
    }
}

export default AuthAccountController;