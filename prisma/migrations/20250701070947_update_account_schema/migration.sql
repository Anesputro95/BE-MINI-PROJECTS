/*
  Warnings:

  - You are about to drop the column `referral_code` on the `account` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[referall_code]` on the table `account` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "account" DROP CONSTRAINT "account_referred_by_fkey";

-- DropIndex
DROP INDEX "account_referral_code_key";

-- AlterTable
ALTER TABLE "account" DROP COLUMN "referral_code",
ADD COLUMN     "referall_code" TEXT,
ALTER COLUMN "referred_by" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "account_referall_code_key" ON "account"("referall_code");
