/*
  Warnings:

  - Added the required column `score` to the `Mark` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Mark" ADD COLUMN     "score" INTEGER NOT NULL;
