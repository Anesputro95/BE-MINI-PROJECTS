/*
  Warnings:

  - A unique constraint covering the columns `[referall_code]` on the table `account` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "account" ADD COLUMN     "isVeriefied" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "referall_code" TEXT,
ADD COLUMN     "referred_by" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "account_referall_code_key" ON "account"("referall_code");
