import e, { NextFunction, Request, Response } from "express";
import AppError from "../errors/AppError";
import { prisma } from "../config/prisma";
import { hashPassword } from "../utils/hash";
import { transport } from "../config/nodemailer";
import { compare } from "bcrypt";
import { sign } from "jsonwebtoken";
import { editProfileService, loginService, regisService, resetPasswordRequestService, resetPasswordService, switchRoleService, uploadProfileService, verifyEmailService } from "../services/auth.service";
import { TOKEN_KEY } from "../config/env"



class AuthAccountController {
    public async register(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            await regisService(req.body)
            res.status(201).json({
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

    public async verifyAccount(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                throw new AppError("Authorization token is missing or invalid", 401)
            }

            const token = authHeader.split(" ")[1];

            if (!token) {
                throw new AppError("Token is Missing", 404)
            }

            await verifyEmailService(token)

            res.status(200).json({
                success: true,
                message: "Email verified successfully",
            });
        } catch (error) {
            next(error);
        }
    }

    public async uploadProfile(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const uploadedUrl = await uploadProfileService(req.file, res.locals.descript.id)
            console.log(uploadedUrl);

            res.status(201).send({
                success: true,
                message: "Upload profile success",
                data: {
                    imageUrl: uploadedUrl
                }
            })
        } catch (error) {
            next(error)
        }
    }

    public async editProfile(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const updated = await editProfileService(req.body, res.locals.descript.id)

            res.status(200).send({
                success: true,
                message: "account berhasil di update",
                data: updated,
            })
        } catch (error) {
            next(error)
        }
    }

    public async requestResetPassword(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const { email } = req.body;
            if (!email) {
                throw new AppError("Email is required", 400)
            }

            await resetPasswordRequestService(email);

            res.status(200).json({
                success: true,
                message: "Reset password link sent to email.",
            })
        } catch (error) {
            next(error)
        }
    }

    public async confirmResetPassword(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const { token, newPassword } = req.body;
            await resetPasswordService(token, newPassword);

            res.status(200).send({
                success: true,
                message: "Password changed successfully",
            })
        } catch (error) {
            next(error)
        }
    }

    public async switchRole(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const updatedUser = await switchRoleService(res.locals.descript.id);

            // ⬅️ Buat token baru setelah update role
            const token = sign(
                {
                    id: updatedUser.id,
                    email: updatedUser.email,
                    role: updatedUser.role,
                },
                process.env.TOKEN_KEY!, // pastikan TOKEN_KEY tersedia di .env
                { expiresIn: "1d" }
            );

            res.status(200).json({
                success: true,
                message: "Role switched successfully",
                role: updatedUser.role,
                token, // ⬅️ kirim token baru ke FE
            });
        } catch (error) {
            next(error)
        }
    }


}

export default AuthAccountController;