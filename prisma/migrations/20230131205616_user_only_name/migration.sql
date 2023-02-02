/*
  Warnings:

  - You are about to drop the column `firstName` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `middleName` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `Teacher` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `Teacher` table. All the data in the column will be lost.
  - You are about to drop the column `middleName` on the `Teacher` table. All the data in the column will be lost.
  - Added the required column `name` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Teacher` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Student" DROP COLUMN "firstName",
DROP COLUMN "lastName",
DROP COLUMN "middleName",
ADD COLUMN     "name" VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE "Teacher" DROP COLUMN "firstName",
DROP COLUMN "lastName",
DROP COLUMN "middleName",
ADD COLUMN     "name" VARCHAR(255) NOT NULL;
