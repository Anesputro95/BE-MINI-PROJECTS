/*
  Warnings:

  - You are about to drop the column `referralCode` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `referredById` on the `account` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "account" DROP CONSTRAINT "account_referredById_fkey";

-- DropIndex
DROP INDEX "account_referralCode_key";

-- AlterTable
ALTER TABLE "account" DROP COLUMN "referralCode",
DROP COLUMN "referredById";
