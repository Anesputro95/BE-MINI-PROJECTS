import { prisma } from "../config/prisma"

export const createCoupon = async (data: { userId: number, code: string, discount: number, expiresAt: Date }) => {
    return prisma.coupon.create({ data })
}