import { prisma } from "../config/prisma";
import { Account } from "../generated/prisma";

export const findAccountByEmail = async (email: string) => {
    return prisma.account.findUnique({
        where: { email }
    })
}

export const findAccountByReferralCode = async (code: string) => {
    return prisma.account.findUnique({
        where: { referall_code: code }
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

export const findAccountById = async (id: number) => {
    return prisma.account.findUnique({
        where: { id }
    })
}

export const updateUser = async (data: Partial<Account>, id: number) => {
    return prisma.account.update({
        data,
        where: { id }
    })
}

export const createPasswordResetToken = async (email: string, token: string, expiresAt: Date) => {
    return prisma.passwordReset.create({
        data: {
            email,
            token,
            expiresAt
        }
    })
}

export const findResetToken = async (token: string) => {
    return prisma.passwordReset.findUnique(
        {
            where: { token }
        }
    )
}

export const deleteResetToken = async (token: string) => {
    return prisma.passwordReset.delete({
        where: { token },
    });
};

export const deleteAllResetTokensByEmail = async (email: string) => {
    return prisma.passwordReset.deleteMany({
        where: { email },
    });
};

export const accountSwitch = {
    findById: (id: number) => prisma.account.findUnique({ where: { id } }),

    updateRole: (id: number, role: "CUSTOMER" | "ORGANIZER") =>
        prisma.account.update({
            where: { id },
            data: { role }
        })
};

export const getCouponsByUserId = async (userId: number) => {
    return prisma.coupon.findMany({
        where: {
            userId,
        },
        select: {
            id: true,
            code: true,
            discount: true,
            expiresAt: true,
        },
    });
};

export const getPointsByUserId = async (userId: number) => {
    return prisma.userPoint.findMany({
        where: { userId },
        select: {
            id: true,
            amount: true,
            expiredAt: true,
        },
    });
};

