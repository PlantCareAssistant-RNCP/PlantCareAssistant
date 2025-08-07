/*
  Warnings:

  - You are about to drop the column `isRecurringInstance` on the `EVENT` table. All the data in the column will be lost.
  - You are about to drop the column `parentEventId` on the `EVENT` table. All the data in the column will be lost.
  - You are about to drop the column `recurringDaysOfWeek` on the `EVENT` table. All the data in the column will be lost.
  - You are about to drop the column `recurringEndDate` on the `EVENT` table. All the data in the column will be lost.
  - You are about to drop the column `recurringInterval` on the `EVENT` table. All the data in the column will be lost.
  - You are about to drop the column `recurringPattern` on the `EVENT` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "EVENT" DROP CONSTRAINT "EVENT_parentEventId_fkey";

-- AlterTable
ALTER TABLE "EVENT" DROP COLUMN "isRecurringInstance",
DROP COLUMN "parentEventId",
DROP COLUMN "recurringDaysOfWeek",
DROP COLUMN "recurringEndDate",
DROP COLUMN "recurringInterval",
DROP COLUMN "recurringPattern",
ADD COLUMN     "notificationId" TEXT;
