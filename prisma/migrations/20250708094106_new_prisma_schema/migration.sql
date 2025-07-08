/*
  Warnings:

  - The values [PENDING,ACCEPTED] on the enum `TransactionStatus` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `ticketId` to the `transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TransactionStatus_new" AS ENUM ('WAITING_PAYMENT', 'WAITING_CONFIRMATION', 'DONE', 'REJECTED', 'EXPIRED', 'CANCELED');
ALTER TABLE "transaction" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "transaction" ALTER COLUMN "status" TYPE "TransactionStatus_new" USING ("status"::text::"TransactionStatus_new");
ALTER TYPE "TransactionStatus" RENAME TO "TransactionStatus_old";
ALTER TYPE "TransactionStatus_new" RENAME TO "TransactionStatus";
DROP TYPE "TransactionStatus_old";
ALTER TABLE "transaction" ALTER COLUMN "status" SET DEFAULT 'WAITING_PAYMENT';
COMMIT;

-- AlterTable
ALTER TABLE "transaction" ADD COLUMN     "paymentProofUploadedAt" TIMESTAMP(3),
ADD COLUMN     "restored" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ticketId" INTEGER NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'WAITING_PAYMENT';
