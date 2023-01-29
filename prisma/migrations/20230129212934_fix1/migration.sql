/*
  Warnings:

  - You are about to drop the `SubgroupStudent` table. If the table is not empty, all the data it contains will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[SubgroupStudent] DROP CONSTRAINT [FK_SubgroupStudent_Student];

-- DropForeignKey
ALTER TABLE [dbo].[SubgroupStudent] DROP CONSTRAINT [FK_SubgroupStudent_SubGroup];

-- AlterTable
ALTER TABLE [dbo].[Teacher] ALTER COLUMN [Password] NVARCHAR(255) NULL;

-- DropTable
DROP TABLE [dbo].[SubgroupStudent];

-- CreateTable
CREATE TABLE [dbo].[_StudentToSubGroup] (
    [A] INT NOT NULL,
    [B] INT NOT NULL,
    CONSTRAINT [_StudentToSubGroup_AB_unique] UNIQUE NONCLUSTERED ([A],[B])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [_StudentToSubGroup_B_index] ON [dbo].[_StudentToSubGroup]([B]);

-- AddForeignKey
ALTER TABLE [dbo].[_StudentToSubGroup] ADD CONSTRAINT [_StudentToSubGroup_A_fkey] FOREIGN KEY ([A]) REFERENCES [dbo].[Student]([Id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[_StudentToSubGroup] ADD CONSTRAINT [_StudentToSubGroup_B_fkey] FOREIGN KEY ([B]) REFERENCES [dbo].[SubGroup]([Id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
