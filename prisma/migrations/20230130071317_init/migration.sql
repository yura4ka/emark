BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Student] (
    [id] INT NOT NULL IDENTITY(1,1),
    [firstName] NVARCHAR(255) NOT NULL,
    [lastName] NVARCHAR(255) NOT NULL,
    [email] VARCHAR(50) NOT NULL,
    [password] NVARCHAR(255),
    [isRequested] BIT NOT NULL CONSTRAINT [DF_Student_isRequested] DEFAULT 0,
    [isConfirmed] BIT NOT NULL CONSTRAINT [DF_Student_IsRegistered] DEFAULT 0,
    [groupId] INT,
    [isSenior] BIT NOT NULL CONSTRAINT [DF_Student_IsSenior] DEFAULT 0,
    CONSTRAINT [PK_Student] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [IX_Student] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[Teacher] (
    [id] INT NOT NULL IDENTITY(1,1),
    [firstName] NVARCHAR(255) NOT NULL,
    [lastName] NVARCHAR(255) NOT NULL,
    [email] VARCHAR(50) NOT NULL,
    [password] NVARCHAR(255),
    [isRequested] BIT NOT NULL CONSTRAINT [DF_Teacher_IsRequested] DEFAULT 0,
    [isConfirmed] BIT NOT NULL CONSTRAINT [DF_Teacher_IsConfirmed] DEFAULT 0,
    [isAdmin] BIT NOT NULL CONSTRAINT [DF_Teacher_IsAdmin] DEFAULT 0,
    CONSTRAINT [PK_Teacher] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Faculty] (
    [id] INT NOT NULL IDENTITY(1,1),
    [title] NVARCHAR(255) NOT NULL,
    CONSTRAINT [PK_Faculty] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Group] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(255) NOT NULL,
    [handlerId] INT,
    [facultyId] INT NOT NULL,
    CONSTRAINT [PK_Group] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [IX_Group_1] UNIQUE NONCLUSTERED ([handlerId])
);

-- CreateTable
CREATE TABLE [dbo].[SubGroup] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(255) NOT NULL,
    [groupId] INT NOT NULL,
    [isFull] BIT NOT NULL CONSTRAINT [DF_SubGroup_IsFull] DEFAULT 0,
    CONSTRAINT [PK_SubGroup] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Subject] (
    [id] INT NOT NULL IDENTITY(1,1),
    [title] NVARCHAR(255) NOT NULL,
    CONSTRAINT [PK_Subject] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Class] (
    [id] INT NOT NULL IDENTITY(1,1),
    [subGroupId] INT NOT NULL,
    [teacherId] INT NOT NULL,
    [subjectId] INT NOT NULL,
    CONSTRAINT [PK_Class] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Task] (
    [id] INT NOT NULL IDENTITY(1,1),
    [dateCreated] DATETIME NOT NULL CONSTRAINT [DF_Task_DateCreated] DEFAULT CURRENT_TIMESTAMP,
    [title] NVARCHAR(255),
    [classId] INT NOT NULL,
    CONSTRAINT [PK_Task] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Mark] (
    [id] INT NOT NULL IDENTITY(1,1),
    [taskId] INT NOT NULL,
    [teacherId] INT,
    [studentId] INT NOT NULL,
    [dateCreated] DATETIME NOT NULL CONSTRAINT [DF_Mark_Date] DEFAULT CURRENT_TIMESTAMP,
    [isNew] BIT NOT NULL CONSTRAINT [DF_Mark_isNew] DEFAULT 0,
    [dateEdited] DATETIME,
    CONSTRAINT [PK_Mark] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[_StudentToSubGroup] (
    [A] INT NOT NULL,
    [B] INT NOT NULL,
    CONSTRAINT [_StudentToSubGroup_AB_unique] UNIQUE NONCLUSTERED ([A],[B])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [_StudentToSubGroup_B_index] ON [dbo].[_StudentToSubGroup]([B]);

-- AddForeignKey
ALTER TABLE [dbo].[Student] ADD CONSTRAINT [FK_Student_Group] FOREIGN KEY ([groupId]) REFERENCES [dbo].[Group]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Group] ADD CONSTRAINT [FK_Group_Faculty] FOREIGN KEY ([facultyId]) REFERENCES [dbo].[Faculty]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Group] ADD CONSTRAINT [FK_Group_Teacher] FOREIGN KEY ([handlerId]) REFERENCES [dbo].[Teacher]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[SubGroup] ADD CONSTRAINT [FK_SubGroup_Group] FOREIGN KEY ([groupId]) REFERENCES [dbo].[Group]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Class] ADD CONSTRAINT [FK_Class_Group] FOREIGN KEY ([subGroupId]) REFERENCES [dbo].[SubGroup]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Class] ADD CONSTRAINT [FK_Class_Subject] FOREIGN KEY ([subjectId]) REFERENCES [dbo].[Subject]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Class] ADD CONSTRAINT [FK_Class_Teacher] FOREIGN KEY ([teacherId]) REFERENCES [dbo].[Teacher]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Task] ADD CONSTRAINT [FK_Task_SubClass] FOREIGN KEY ([classId]) REFERENCES [dbo].[Class]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Mark] ADD CONSTRAINT [FK_Mark_Student] FOREIGN KEY ([studentId]) REFERENCES [dbo].[Student]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Mark] ADD CONSTRAINT [FK_Mark_Task] FOREIGN KEY ([taskId]) REFERENCES [dbo].[Task]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Mark] ADD CONSTRAINT [FK_Mark_Teacher] FOREIGN KEY ([teacherId]) REFERENCES [dbo].[Teacher]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[_StudentToSubGroup] ADD CONSTRAINT [_StudentToSubGroup_A_fkey] FOREIGN KEY ([A]) REFERENCES [dbo].[Student]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[_StudentToSubGroup] ADD CONSTRAINT [_StudentToSubGroup_B_fkey] FOREIGN KEY ([B]) REFERENCES [dbo].[SubGroup]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
