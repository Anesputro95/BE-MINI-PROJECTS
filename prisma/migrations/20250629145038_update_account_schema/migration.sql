/*
  Warnings:

  - The values [customer,eventOrganizer] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[referralCode]` on the table `account` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `referralCode` to the `account` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('CUSTOMER', 'ORGANIZER');
ALTER TABLE "account" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
COMMIT;

-- AlterTable
ALTER TABLE "account" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "referralCode" TEXT NOT NULL,
ADD COLUMN     "referredById" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "account_referralCode_key" ON "account"("referralCode");

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
