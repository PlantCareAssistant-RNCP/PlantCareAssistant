-- AlterTable
ALTER TABLE "EVENT" ADD COLUMN     "isRecurringInstance" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "parentEventId" INTEGER,
ADD COLUMN     "recurringDaysOfWeek" TEXT,
ADD COLUMN     "recurringEndDate" TIMESTAMP(3),
ADD COLUMN     "recurringInterval" INTEGER,
ADD COLUMN     "recurringPattern" TEXT;

-- AddForeignKey
ALTER TABLE "EVENT" ADD CONSTRAINT "EVENT_parentEventId_fkey" FOREIGN KEY ("parentEventId") REFERENCES "EVENT"("id") ON DELETE SET NULL ON UPDATE CASCADE;
