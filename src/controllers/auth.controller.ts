import e, { NextFunction, Request, Response } from "express";
import AppError from "../errors/AppError";
import { prisma } from "../config/prisma";
import { hashPassword } from "../utils/hash";
import { transport } from "../config/nodemailer";
import { compare } from "bcrypt";
import { sign } from "jsonwebtoken";
import { editProfileService, loginService, regisService, resetPasswordRequestService, resetPasswordService, switchRoleService, uploadProfileService, verifyEmailService } from "../services/auth.service";
import { TOKEN_KEY } from "../config/env"
import { findAccountById, getCouponsByUserId, getPointsByUserId } from "../repositories/account.repositori";



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
            const loginAccount = await loginService(req.body);
            const user = loginAccount.account;

            // ✅ Ambil kupon dan poin user
            const coupons = await getCouponsByUserId(user.id);
            const points = await getPointsByUserId(user.id);

            // ✅ Buat token dengan field lengkap
            const token = sign(
                {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    role: user.role,
                    referralCode: user.referall_code,
                    profileImg: user.ImgProfile,
                    coupons,
                    userPoints: points,
                },
                process.env.TOKEN_KEY!,
                { expiresIn: "1d" }
            );

            res.status(200).json({
                message: "Login Success",
                email: user.email,
                imgProfile: user.ImgProfile,
                role: user.role,
                referral_code: user.referall_code,
                token, // ✅ kirim token lengkap
            });
        } catch (error) {
            next(error);
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
            const userId = res.locals.descript.id;

            const uploadedUrl = await uploadProfileService(req.file, userId);
            const user = await findAccountById(userId);
            if (!user) {
                throw new AppError("User not found after upload", 404);
            }

            const coupons = await getCouponsByUserId(userId);
            const points = await getPointsByUserId(userId);

            const token = sign(
                {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    role: user.role,
                    referralCode: user.referall_code,
                    profileImg: uploadedUrl,
                    coupons,
                    userPoints: points,
                },
                process.env.TOKEN_KEY!,
                { expiresIn: "1d" }
            );

            res.status(201).send({
                success: true,
                message: "Upload profile success",
                data: {
                    imageUrl: uploadedUrl,
                    token,
                },
            });
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
            const coupons = await getCouponsByUserId(updatedUser.id);
            const points = await getPointsByUserId(updatedUser.id);

            // ⬅️ Buat token baru setelah update role
            const token = sign(
                {
                    id: updatedUser.id,
                    email: updatedUser.email,
                    username: updatedUser.username,
                    role: updatedUser.role,
                    referralCode: updatedUser.referall_code,
                    profileImg: updatedUser.ImgProfile,
                    coupons,
                    userPoints: points,
                },
                process.env.TOKEN_KEY!,
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