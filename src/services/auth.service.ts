import { compare } from "bcrypt";
import { transport } from "../config/nodemailer";
import AppError from "../errors/AppError";
import { createAccountByEmail, findAccountByEmail, findAccountByReferralCode, loginAccountByEmail } from "../repositories/account.repositori";
import { hashPassword } from "../utils/hash";
import { sign } from "jsonwebtoken";

export const regisService = async (data: any) => {
    const { username, email, password, role } = data;

    const exitingAccount = await findAccountByEmail(email);
    if (exitingAccount) {
        throw new AppError("User already exist", 400);
    }

    let referredBy = null;
    const referralCode = data.referralCode;

    if (referralCode) {
        const referrer = await findAccountByReferralCode(referralCode);
        if (!referrer) {
            throw new AppError("Invalid referral code", 400);
        }
        referredBy = referralCode;
    }

    let referralCodeNew = "";
    let isUnique = false;
    while (!isUnique) {
        const code = `${username}-${Math.random().toString(36).substring(2, 8)}`;
        const existingCode = await findAccountByReferralCode(code);
        if (!existingCode) {
            referralCodeNew = code;
            isUnique = true;
        }
    }

    const newAccount = await createAccountByEmail({
        username,
        email,
        password: await hashPassword(password),
        role: role || "ORGANIZER",
        isVeriefied: false,
        referall_code: referralCodeNew,
        referred_by: referredBy
    });

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

    return newAccount;
}

export const loginService = async (data: any) => {
    const { email } = data;

    const findUser = await loginAccountByEmail(email)

    if (!findUser) {
        throw new AppError("Email not registered", 404);
    };

    if (!findUser.isVeriefied) {
        throw new AppError("Email not verify, please verify first", 401)
    }

    const comparePass = await compare(data.password, findUser.password);
    if (!comparePass) {
        throw new AppError("Password is wrong", 401);
    }

    const token = sign(
        { id: findUser.id, role: findUser.role },
        process.env.TOKEN_KEY || "secret",
        { expiresIn: "1d" }
    );

    return {
        token,
        account: findUser
    }
}