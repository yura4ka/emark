/*
  Warnings:

  - You are about to drop the column `maxScore` on the `Mark` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[title]` on the table `Faculty` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `maxScore` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Mark" DROP COLUMN "maxScore";

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "maxScore" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Faculty_title_key" ON "Faculty"("title");
