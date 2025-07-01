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

export const verifyAccountByEmail = async (email: string) => {
    return prisma.account.update({
        where: { email },
        data: { isVeriefied: true },
    });
};


type CreateAccountInput = {
    username: string;
    email: string;
    password: string;
    role: "CUSTOMER" | "ORGANIZER";
    isVeriefied?: boolean;
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