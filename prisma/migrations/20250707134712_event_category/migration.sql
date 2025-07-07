/*
  Warnings:

  - The values [Default,Concert,Seminar,Workshop,Sports,Theatre,Festival,Wellness,Kids,Education] on the enum `EventCategory` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EventCategory_new" AS ENUM ('DEFAULT', 'CONCERT', 'SEMINAR', 'WORKSHOP', 'SPORTS', 'THEATRE', 'FESTIVAL', 'WELLNESS', 'KIDS', 'EDUCATION');
ALTER TABLE "event" ALTER COLUMN "category" DROP DEFAULT;
ALTER TABLE "event" ALTER COLUMN "category" TYPE "EventCategory_new" USING ("category"::text::"EventCategory_new");
ALTER TYPE "EventCategory" RENAME TO "EventCategory_old";
ALTER TYPE "EventCategory_new" RENAME TO "EventCategory";
DROP TYPE "EventCategory_old";
ALTER TABLE "event" ALTER COLUMN "category" SET DEFAULT 'DEFAULT';
COMMIT;

-- AlterTable
ALTER TABLE "event" ALTER COLUMN "category" SET DEFAULT 'DEFAULT';
