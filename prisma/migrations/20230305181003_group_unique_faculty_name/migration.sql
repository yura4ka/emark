/*
  Warnings:

  - A unique constraint covering the columns `[facultyId,name]` on the table `Group` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Group_facultyId_name_key" ON "Group"("facultyId", "name");
