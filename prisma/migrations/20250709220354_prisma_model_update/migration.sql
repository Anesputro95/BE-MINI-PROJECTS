-- AlterTable
ALTER TABLE "voucher" ADD COLUMN     "discountPercent" DOUBLE PRECISION,
ADD COLUMN     "maxDiscount" INTEGER,
ALTER COLUMN "discountAmount" DROP NOT NULL;
