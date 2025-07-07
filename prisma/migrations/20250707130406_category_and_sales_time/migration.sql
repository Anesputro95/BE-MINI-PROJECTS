-- CreateEnum
CREATE TYPE "EventCategory" AS ENUM ('Default', 'Concert', 'Seminar', 'Workshop', 'Sports', 'Theatre', 'Festival', 'Wellness', 'Kids', 'Education');

-- AlterTable
ALTER TABLE "event" ADD COLUMN     "category" "EventCategory" NOT NULL DEFAULT 'Default',
ADD COLUMN     "salesEnd" TIMESTAMP(3),
ADD COLUMN     "salesStart" TIMESTAMP(3);
