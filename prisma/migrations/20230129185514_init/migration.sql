BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Class] (
    [Id] INT NOT NULL,
    [GroupId] INT NOT NULL,
    [TeacherId] INT NOT NULL,
    [SubjectId] INT NOT NULL,
    CONSTRAINT [PK_Class] PRIMARY KEY CLUSTERED ([Id])
);

-- CreateTable
CREATE TABLE [dbo].[Faculty] (
    [Id] INT NOT NULL,
    [Title] NVARCHAR(255) NOT NULL,
    CONSTRAINT [PK_Faculty] PRIMARY KEY CLUSTERED ([Id])
);

-- CreateTable
CREATE TABLE [dbo].[Group] (
    [Id] INT NOT NULL,
    [Name] NVARCHAR(255) NOT NULL,
    [HandlerId] INT,
    [FacultyId] INT NOT NULL,
    CONSTRAINT [PK_Group] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [IX_Group_1] UNIQUE NONCLUSTERED ([HandlerId])
);

-- CreateTable
CREATE TABLE [dbo].[Mark] (
    [Id] INT NOT NULL,
    [TaskId] INT NOT NULL,
    [TeacherId] INT,
    [StudentId] INT NOT NULL,
    [DateCreated] DATETIME NOT NULL CONSTRAINT [DF_Mark_Date] DEFAULT CURRENT_TIMESTAMP,
    [IsNew] BIT NOT NULL CONSTRAINT [DF_Mark_isNew] DEFAULT 0,
    [DateEdited] DATETIME,
    CONSTRAINT [PK_Mark] PRIMARY KEY CLUSTERED ([Id])
);

-- CreateTable
CREATE TABLE [dbo].[Student] (
    [Id] INT NOT NULL,
    [FirstName] NVARCHAR(255) NOT NULL,
    [LastName] NVARCHAR(255) NOT NULL,
    [Email] VARCHAR(50) NOT NULL,
    [Password] NVARCHAR(255),
    [IsRequested] BIT NOT NULL CONSTRAINT [DF_Student_isRequested] DEFAULT 0,
    [IsConfirmed] BIT NOT NULL CONSTRAINT [DF_Student_IsRegistered] DEFAULT 0,
    [GroupId] INT,
    [IsSenior] BIT NOT NULL CONSTRAINT [DF_Student_IsSenior] DEFAULT 0,
    CONSTRAINT [PK_Student] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [IX_Student] UNIQUE NONCLUSTERED ([Email])
);

-- CreateTable
CREATE TABLE [dbo].[SubClass] (
    [Id] INT NOT NULL,
    [SubGroupId] INT NOT NULL,
    [ClassId] INT NOT NULL,
    [TeacherId] INT,
    CONSTRAINT [PK_SubClass] PRIMARY KEY CLUSTERED ([Id])
);

-- CreateTable
CREATE TABLE [dbo].[SubGroup] (
    [Id] INT NOT NULL,
    [Name] NVARCHAR(255) NOT NULL,
    [GroupId] INT NOT NULL,
    [IsFull] BIT NOT NULL CONSTRAINT [DF_SubGroup_IsFull] DEFAULT 0,
    CONSTRAINT [PK_SubGroup] PRIMARY KEY CLUSTERED ([Id])
);

-- CreateTable
CREATE TABLE [dbo].[SubgroupStudent] (
    [Id] INT NOT NULL,
    [StudentId] INT NOT NULL,
    [SubGroupId] INT NOT NULL,
    CONSTRAINT [PK_SubgroupStudent] PRIMARY KEY CLUSTERED ([Id])
);

-- CreateTable
CREATE TABLE [dbo].[Subject] (
    [Id] INT NOT NULL,
    [Name] NVARCHAR(255) NOT NULL,
    CONSTRAINT [PK_Subject] PRIMARY KEY CLUSTERED ([Id])
);

-- CreateTable
CREATE TABLE [dbo].[sysdiagrams] (
    [name] NVARCHAR(128) NOT NULL,
    [principal_id] INT NOT NULL,
    [diagram_id] INT NOT NULL IDENTITY(1,1),
    [version] INT,
    [definition] VARBINARY(max),
    CONSTRAINT [PK__sysdiagr__C2B05B613951DA51] PRIMARY KEY CLUSTERED ([diagram_id]),
    CONSTRAINT [UK_principal_name] UNIQUE NONCLUSTERED ([principal_id],[name])
);

-- CreateTable
CREATE TABLE [dbo].[Task] (
    [Id] INT NOT NULL,
    [DateCreated] DATETIME NOT NULL CONSTRAINT [DF_Task_DateCreated] DEFAULT CURRENT_TIMESTAMP,
    [Title] NVARCHAR(255),
    [SubClassId] INT NOT NULL,
    CONSTRAINT [PK_Task] PRIMARY KEY CLUSTERED ([Id])
);

-- CreateTable
CREATE TABLE [dbo].[Teacher] (
    [Id] INT NOT NULL,
    [FirstName] NVARCHAR(255) NOT NULL,
    [LastName] NVARCHAR(255) NOT NULL,
    [Email] VARCHAR(50) NOT NULL,
    [Password] NVARCHAR(255) NOT NULL,
    [IsRequested] BIT NOT NULL CONSTRAINT [DF_Teacher_IsRequested] DEFAULT 0,
    [IsConfirmed] BIT NOT NULL CONSTRAINT [DF_Teacher_IsConfirmed] DEFAULT 0,
    [IsAdmin] BIT NOT NULL CONSTRAINT [DF_Teacher_IsAdmin] DEFAULT 0,
    CONSTRAINT [PK_Teacher] PRIMARY KEY CLUSTERED ([Id])
);

-- AddForeignKey
ALTER TABLE [dbo].[Class] ADD CONSTRAINT [FK_Class_Group] FOREIGN KEY ([GroupId]) REFERENCES [dbo].[Group]([Id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Class] ADD CONSTRAINT [FK_Class_Subject] FOREIGN KEY ([SubjectId]) REFERENCES [dbo].[Subject]([Id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Class] ADD CONSTRAINT [FK_Class_Teacher] FOREIGN KEY ([TeacherId]) REFERENCES [dbo].[Teacher]([Id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Group] ADD CONSTRAINT [FK_Group_Faculty] FOREIGN KEY ([FacultyId]) REFERENCES [dbo].[Faculty]([Id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Group] ADD CONSTRAINT [FK_Group_Teacher] FOREIGN KEY ([HandlerId]) REFERENCES [dbo].[Teacher]([Id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Mark] ADD CONSTRAINT [FK_Mark_Student] FOREIGN KEY ([StudentId]) REFERENCES [dbo].[Student]([Id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Mark] ADD CONSTRAINT [FK_Mark_Task] FOREIGN KEY ([TaskId]) REFERENCES [dbo].[Task]([Id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Mark] ADD CONSTRAINT [FK_Mark_Teacher] FOREIGN KEY ([TeacherId]) REFERENCES [dbo].[Teacher]([Id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Student] ADD CONSTRAINT [FK_Student_Group] FOREIGN KEY ([GroupId]) REFERENCES [dbo].[Group]([Id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[SubClass] ADD CONSTRAINT [FK_SubClass_Class] FOREIGN KEY ([ClassId]) REFERENCES [dbo].[Class]([Id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[SubClass] ADD CONSTRAINT [FK_SubClass_SubGroup] FOREIGN KEY ([SubGroupId]) REFERENCES [dbo].[SubGroup]([Id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[SubClass] ADD CONSTRAINT [FK_SubClass_Teacher] FOREIGN KEY ([TeacherId]) REFERENCES [dbo].[Teacher]([Id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[SubGroup] ADD CONSTRAINT [FK_SubGroup_Group] FOREIGN KEY ([GroupId]) REFERENCES [dbo].[Group]([Id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[SubgroupStudent] ADD CONSTRAINT [FK_SubgroupStudent_Student] FOREIGN KEY ([StudentId]) REFERENCES [dbo].[Student]([Id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[SubgroupStudent] ADD CONSTRAINT [FK_SubgroupStudent_SubGroup] FOREIGN KEY ([SubGroupId]) REFERENCES [dbo].[SubGroup]([Id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Task] ADD CONSTRAINT [FK_Task_SubClass] FOREIGN KEY ([SubClassId]) REFERENCES [dbo].[SubClass]([Id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
