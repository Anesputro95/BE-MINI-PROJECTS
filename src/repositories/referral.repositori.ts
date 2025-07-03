import { prisma } from "../config/prisma"

export const createReferral = async (referrerId: number, referredId: number) =>
     prisma.referall.create({
        data: { referrerId, referredId }
    });
