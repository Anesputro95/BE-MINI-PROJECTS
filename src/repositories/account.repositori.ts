import { prisma } from "../config/prisma";
import { Account } from "../generated/prisma";

export const findAccountByEmail = async (email: string) => {
    return prisma.account.findUnique({
        where: { email }
    })
}

export const findAccountByReferralCode = async (referall_code: string) => {
    return prisma.account.findUnique({
        where: { referall_code }
    })
}

type CreateAccountInput = {
    username: string;
    email: string;
    password: string;
    role: "CUSTOMER" | "ORGANIZER";
    isVerified?: boolean;
    referall_code?: string;
    referred_by?: string;
    ImgProfile?: string;
};

export const createAccountByEmail = async (
    data: CreateAccountInput) => {
    return prisma.account.create({ data })
}
export const loginAccountByEmail = async (email: string) => {
    return prisma.account.findUnique({
        where: { email }
    })
}

export const createVerificationToken = async (accountId: number, token: string, expiresAt: Date) => {
    return prisma.emailVerification.create({
        data: {
            accountId,
            token,
            expiresAt,
        }
    })
}

export const findVerificationToken = async (token: string) => {
    return prisma.emailVerification.findUnique({
        where: { token },
        include: { account: true }
    })
}

export const deleteVerificationToken = async (token: string) => {
    return prisma.emailVerification.delete({
        where: { token },
    })
}

export const verifyAccountByEmail = async (email: string) => {
    return prisma.account.update({
        where: { email },
        data: {
            isVerified: true,
        }
    });
};