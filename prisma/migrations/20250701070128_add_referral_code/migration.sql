/*
  Warnings:

  - You are about to drop the column `isVeriefied` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `referall_code` on the `account` table. All the data in the column will be lost.
  - The `referred_by` column on the `account` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[referral_code]` on the table `account` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `referral_code` to the `account` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "account_referall_code_key";

-- AlterTable
ALTER TABLE "account" DROP COLUMN "isVeriefied",
DROP COLUMN "referall_code",
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "referral_code" TEXT NOT NULL,
DROP COLUMN "referred_by",
ADD COLUMN     "referred_by" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "account_referral_code_key" ON "account"("referral_code");

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_referred_by_fkey" FOREIGN KEY ("referred_by") REFERENCES "account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
