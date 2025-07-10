import dotenv from "dotenv";
dotenv.config();

export const TOKEN_KEY = process.env.TOKEN_KEY as string;

if (!TOKEN_KEY) {
  throw new Error("TOKEN_KEY is not defined in .env");
}
