/*
  Warnings:

  - Added the required column `middleName` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `middleName` to the `Teacher` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "middleName" VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN     "middleName" VARCHAR(255) NOT NULL;
