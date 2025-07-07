import { compare } from "bcrypt";
import { transport } from "../config/nodemailer";
import AppError from "../errors/AppError";
import { createAccountByEmail, createPasswordResetToken, createVerificationToken, deleteAllResetTokensByEmail, deleteResetToken, deleteVerificationToken, findAccountByEmail, findAccountById, findAccountByReferralCode, findResetToken, findVerificationToken, loginAccountByEmail, updateUser, verifyAccountByEmail } from "../repositories/account.repositori";
import { hashPassword } from "../utils/hash";
import { sign } from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { createReferral } from "../repositories/referral.repositori";
import { createUserPoints } from "../repositories/userPoints.repositori";
import { createCoupon } from "../repositories/coupon.repositori";
import { cloudinaryUpload } from "../config/cloudinary";
import { prisma } from "../config/prisma";
import { Multer } from "multer";

export const regisService = async (data: any) => {
  const { username, email, password, role } = data;

  const exitingAccount = await findAccountByEmail(email);
  if (exitingAccount) {
    throw new AppError("User already exist", 400);
  }

  let referredBy = null;
  const referralCode = data.referralCode;
  let referrer = null

  if (referralCode) {
    referrer = await findAccountByReferralCode(referralCode);
    if (!referrer) {
      throw new AppError("Invalid referral code", 400);
    }
    referredBy = referralCode;
  }

  let referralCodeNew = "";
  let isUnique = false;
  while (!isUnique) {
    const code = `${username}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const existingCode = await findAccountByReferralCode(code);
    if (!existingCode) {
      referralCodeNew = code;
      isUnique = true;
    }
  }

  const allowedRoles = ["CUSTOMER", "ORGANIZER"]
  const safeRoles = allowedRoles.includes(role) ? role : "CUSTOMER"

  const newAccount = await createAccountByEmail({
    username,
    email,
    password: await hashPassword(password),
    role: safeRoles,
    isVerified: false,
    referall_code: referralCodeNew,
    referred_by: referredBy
  });

  if (referralCode && referrer) {
    // point expires selama 3 bulan
    const now = new Date();
    const pointExpire = new Date(now);
    pointExpire.setMonth(now.getMonth() + 3);

    // tambah ke tabel referall
    await createReferral(referrer.id, newAccount.id)
    // tamabah 10.000 point ke referrer
    await createUserPoints({
      userId: referrer.id,
      amount: 10000,
      expiredAt: pointExpire,
    })
    // tambah coupon ke newaccount 
    const couponCode = `Coupon-${newAccount.id}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

    await createCoupon({
      userId: newAccount.id,
      code: couponCode,
      discount: 10,
      expiresAt: pointExpire,
    })
  }

  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 jam

  await createVerificationToken(newAccount.id, token, expiresAt);

  const verifyLink = `${process.env.BASE_URL}/auth/verify/${token}`;

  console.log("📧 Verification link sent:", verifyLink);

  console.log("📧 Verification link sent:", verifyLink); // ⬅️ Tambahkan ini


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
      
              <a href="${verifyLink}" class="btn">Verify My Account</a>
      
              <p>If the button above doesn't work, copy and paste the following link into your browser:</p>
              <a href="${verifyLink}" class="">click here</a>
              
      
              <div class="footer">
                <p>This email was sent by Event App. If you did not sign up, please ignore this message.</p>
              </div>
            </div>
          </body>
        </html>
        `,
  });

  return newAccount;
};

export const loginService = async (data: any) => {
  const { email } = data;

  const findUser = await loginAccountByEmail(email)

  if (!findUser) {
    throw new AppError("Email not registered", 404);
  };

  if (!findUser.isVerified) {
    throw new AppError("Email not verify, please verify first", 401)
  }

  const comparePass = await compare(data.password, findUser.password);
  if (!comparePass) {
    throw new AppError("Password is wrong", 401);
  }

  const token = sign(
    { id: findUser.id, role: findUser.role },
    process.env.TOKEN_KEY || "fallback_secret",
    { expiresIn: "1d" }
  );

  return {
    token,
    account: findUser
  }
};

export const verifyEmailService = async (token: string) => {
  const record = await findVerificationToken(token);
  if (!record) throw new AppError("Invalid or expired token", 404);

  if (record.expiresAt < new Date()) {
    await deleteVerificationToken(token);
    throw new AppError("Token has expired", 400);
  }

  await verifyAccountByEmail(record.account.email);
  await deleteVerificationToken(token);
};

export const uploadProfileService = async (
  file: Express.Multer.File | undefined,
  id: number,
) => {
  if (!file) {
    throw new AppError("No file exist", 400);
  }
  console.log("FILE YANG DIKIRIM:", file);

  const upload = await cloudinaryUpload(file);

  await updateUser({ ImgProfile: upload.secure_url }, id)
  return upload.secure_url;
};

export const editProfileService = async (data: any, userId: number) => {
  const account = await findAccountById(userId);

  if (!account) {
    throw new AppError("User not found", 404);
  }

  if (!data.oldpassword || !data.newPassword) {
    throw new AppError("Old and new passwords must be filled in.", 400)
  }

  const isMatch = await bcrypt.compare(data.oldpassword, account.password);
  if (!isMatch) {
    throw new AppError("Password is not correct", 404)
  };

  const hashedNewPassword = await bcrypt.hash(data.newPassword, 10);

  const updatedUser = await updateUser(
    {
      username: data.username || account.username,
      password: hashedNewPassword
    },
    userId
  )

  return updatedUser;
}

export const resetPasswordRequestService = async (email: string) => {
  const account = await findAccountByEmail(email);

  if (!account) {
    return;
  };

  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 menit

  const tokenData = await findResetToken(token); 

  await deleteAllResetTokensByEmail(email);
  await createPasswordResetToken(email, token, expiresAt);

  const resetLink = `${process.env.BASE_URL}/reset-password/${token}`;

  await transport.sendMail({
    to: email,
    subject: "Reset Password",
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
                background-color: #dc3545;
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
              <p>You have requested to reset your password.</p>
              <p>Click the button below to create a new password:</p>

              <a href="${resetLink}" class="btn">Reset My Password</a>

              <p>If the button above doesn't work, copy and paste the following link into your browser:</p>
              <br>
              <a href="${resetLink}">Click Here</a>

              <div class="footer">
                <p>This email was sent by Event App. If you did not request a password reset, please ignore this message or contact support.</p>
              </div>
              <p>This link is valid for 30 minutes only.</p>

            </div>
          </body>
        </html>
        `
  })

  return token;
}

export const resetPasswordService = async (token: string, newPassword: string) => {
  console.log("Token received:", token);

  const tokenData = await findResetToken(token);
  console.log("Token from DB:", tokenData);

  if (!tokenData || tokenData.expiresAt < new Date()) {
    throw new AppError("Token invalid", 400);
  };

  const account = await findAccountByEmail(tokenData.email);
  if (!account) {
    throw new AppError("User not exist", 404)
  }

  const hashPassword = await bcrypt.hash(newPassword, 10);
  await updateUser({ password: hashPassword }, account.id);

  await deleteResetToken(token);
}
