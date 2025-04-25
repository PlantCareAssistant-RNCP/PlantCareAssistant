/*
  Warnings:

  - You are about to drop the `Event` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Event";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "EVENT" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "start" DATETIME NOT NULL,
    "end" DATETIME NOT NULL,
    "userId" INTEGER NOT NULL,
    "plantId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EVENT_userId_fkey" FOREIGN KEY ("userId") REFERENCES "USER" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EVENT_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "PLANT" ("plant_id") ON DELETE SET NULL ON UPDATE CASCADE
);
