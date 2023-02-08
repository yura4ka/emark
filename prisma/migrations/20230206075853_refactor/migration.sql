/*
  Warnings:

  - You are about to drop the column `isSenior` on the `Student` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[seniorId]` on the table `Group` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `maxScore` to the `Mark` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "seniorId" INTEGER;

-- AlterTable
ALTER TABLE "Mark" ADD COLUMN     "comment" TEXT,
ADD COLUMN     "maxScore" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "isSenior";

-- CreateIndex
CREATE UNIQUE INDEX "Group_seniorId_key" ON "Group"("seniorId");

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_seniorId_fkey" FOREIGN KEY ("seniorId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;
