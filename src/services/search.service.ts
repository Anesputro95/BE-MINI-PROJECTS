import { prisma } from "../config/prisma";

export const searchUsersService = async (query: string) => {
  return await prisma.account.findMany({
    where: {
      username: {
        contains: query,
        mode: "insensitive", // makes it case-insensitive
      },
    },
    select: {
      id: true,
      username: true,
      email: true,
    },
  });
};
