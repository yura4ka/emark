BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[_StudentToSubGroup] DROP CONSTRAINT [_StudentToSubGroup_A_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[_StudentToSubGroup] DROP CONSTRAINT [_StudentToSubGroup_B_fkey];

-- RedefineTables
BEGIN TRANSACTION;
DECLARE @SQL NVARCHAR(MAX) = N''
SELECT @SQL += N'ALTER TABLE '
    + QUOTENAME(OBJECT_SCHEMA_NAME(PARENT_OBJECT_ID))
    + '.'
    + QUOTENAME(OBJECT_NAME(PARENT_OBJECT_ID))
    + ' DROP CONSTRAINT '
    + OBJECT_NAME(OBJECT_ID) + ';'
FROM SYS.OBJECTS
WHERE TYPE_DESC LIKE '%CONSTRAINT'
    AND OBJECT_NAME(PARENT_OBJECT_ID) = 'Class'
    AND SCHEMA_NAME(SCHEMA_ID) = 'dbo'
EXEC sp_executesql @SQL
;
CREATE TABLE [dbo].[_prisma_new_Class] (
    [Id] INT NOT NULL IDENTITY(1,1),
    [GroupId] INT NOT NULL,
    [TeacherId] INT NOT NULL,
    [SubjectId] INT NOT NULL,
    CONSTRAINT [PK_Class] PRIMARY KEY CLUSTERED ([Id])
);
SET IDENTITY_INSERT [dbo].[_prisma_new_Class] ON;
IF EXISTS(SELECT * FROM [dbo].[Class])
    EXEC('INSERT INTO [dbo].[_prisma_new_Class] ([GroupId],[Id],[SubjectId],[TeacherId]) SELECT [GroupId],[Id],[SubjectId],[TeacherId] FROM [dbo].[Class] WITH (holdlock tablockx)');
SET IDENTITY_INSERT [dbo].[_prisma_new_Class] OFF;
DROP TABLE [dbo].[Class];
EXEC SP_RENAME N'dbo._prisma_new_Class', N'Class';
DECLARE @SQL NVARCHAR(MAX) = N''
SELECT @SQL += N'ALTER TABLE '
    + QUOTENAME(OBJECT_SCHEMA_NAME(PARENT_OBJECT_ID))
    + '.'
    + QUOTENAME(OBJECT_NAME(PARENT_OBJECT_ID))
    + ' DROP CONSTRAINT '
    + OBJECT_NAME(OBJECT_ID) + ';'
FROM SYS.OBJECTS
WHERE TYPE_DESC LIKE '%CONSTRAINT'
    AND OBJECT_NAME(PARENT_OBJECT_ID) = 'Teacher'
    AND SCHEMA_NAME(SCHEMA_ID) = 'dbo'
EXEC sp_executesql @SQL
;
CREATE TABLE [dbo].[_prisma_new_Teacher] (
    [Id] INT NOT NULL IDENTITY(1,1),
    [FirstName] NVARCHAR(255) NOT NULL,
    [LastName] NVARCHAR(255) NOT NULL,
    [Email] VARCHAR(50) NOT NULL,
    [Password] NVARCHAR(255),
    [IsRequested] BIT NOT NULL CONSTRAINT [DF_Teacher_IsRequested] DEFAULT 0,
    [IsConfirmed] BIT NOT NULL CONSTRAINT [DF_Teacher_IsConfirmed] DEFAULT 0,
    [IsAdmin] BIT NOT NULL CONSTRAINT [DF_Teacher_IsAdmin] DEFAULT 0,
    CONSTRAINT [PK_Teacher] PRIMARY KEY CLUSTERED ([Id])
);
SET IDENTITY_INSERT [dbo].[_prisma_new_Teacher] ON;
IF EXISTS(SELECT * FROM [dbo].[Teacher])
    EXEC('INSERT INTO [dbo].[_prisma_new_Teacher] ([Email],[FirstName],[Id],[IsAdmin],[IsConfirmed],[IsRequested],[LastName],[Password]) SELECT [Email],[FirstName],[Id],[IsAdmin],[IsConfirmed],[IsRequested],[LastName],[Password] FROM [dbo].[Teacher] WITH (holdlock tablockx)');
SET IDENTITY_INSERT [dbo].[_prisma_new_Teacher] OFF;
DROP TABLE [dbo].[Teacher];
EXEC SP_RENAME N'dbo._prisma_new_Teacher', N'Teacher';
DECLARE @SQL NVARCHAR(MAX) = N''
SELECT @SQL += N'ALTER TABLE '
    + QUOTENAME(OBJECT_SCHEMA_NAME(PARENT_OBJECT_ID))
    + '.'
    + QUOTENAME(OBJECT_NAME(PARENT_OBJECT_ID))
    + ' DROP CONSTRAINT '
    + OBJECT_NAME(OBJECT_ID) + ';'
FROM SYS.OBJECTS
WHERE TYPE_DESC LIKE '%CONSTRAINT'
    AND OBJECT_NAME(PARENT_OBJECT_ID) = 'Mark'
    AND SCHEMA_NAME(SCHEMA_ID) = 'dbo'
EXEC sp_executesql @SQL
;
CREATE TABLE [dbo].[_prisma_new_Mark] (
    [Id] INT NOT NULL IDENTITY(1,1),
    [TaskId] INT NOT NULL,
    [TeacherId] INT,
    [StudentId] INT NOT NULL,
    [DateCreated] DATETIME NOT NULL CONSTRAINT [DF_Mark_Date] DEFAULT CURRENT_TIMESTAMP,
    [IsNew] BIT NOT NULL CONSTRAINT [DF_Mark_isNew] DEFAULT 0,
    [DateEdited] DATETIME,
    CONSTRAINT [PK_Mark] PRIMARY KEY CLUSTERED ([Id])
);
SET IDENTITY_INSERT [dbo].[_prisma_new_Mark] ON;
IF EXISTS(SELECT * FROM [dbo].[Mark])
    EXEC('INSERT INTO [dbo].[_prisma_new_Mark] ([DateCreated],[DateEdited],[Id],[IsNew],[StudentId],[TaskId],[TeacherId]) SELECT [DateCreated],[DateEdited],[Id],[IsNew],[StudentId],[TaskId],[TeacherId] FROM [dbo].[Mark] WITH (holdlock tablockx)');
SET IDENTITY_INSERT [dbo].[_prisma_new_Mark] OFF;
DROP TABLE [dbo].[Mark];
EXEC SP_RENAME N'dbo._prisma_new_Mark', N'Mark';
DECLARE @SQL NVARCHAR(MAX) = N''
SELECT @SQL += N'ALTER TABLE '
    + QUOTENAME(OBJECT_SCHEMA_NAME(PARENT_OBJECT_ID))
    + '.'
    + QUOTENAME(OBJECT_NAME(PARENT_OBJECT_ID))
    + ' DROP CONSTRAINT '
    + OBJECT_NAME(OBJECT_ID) + ';'
FROM SYS.OBJECTS
WHERE TYPE_DESC LIKE '%CONSTRAINT'
    AND OBJECT_NAME(PARENT_OBJECT_ID) = 'SubGroup'
    AND SCHEMA_NAME(SCHEMA_ID) = 'dbo'
EXEC sp_executesql @SQL
;
CREATE TABLE [dbo].[_prisma_new_SubGroup] (
    [Id] INT NOT NULL IDENTITY(1,1),
    [Name] NVARCHAR(255) NOT NULL,
    [GroupId] INT NOT NULL,
    [IsFull] BIT NOT NULL CONSTRAINT [DF_SubGroup_IsFull] DEFAULT 0,
    CONSTRAINT [PK_SubGroup] PRIMARY KEY CLUSTERED ([Id])
);
SET IDENTITY_INSERT [dbo].[_prisma_new_SubGroup] ON;
IF EXISTS(SELECT * FROM [dbo].[SubGroup])
    EXEC('INSERT INTO [dbo].[_prisma_new_SubGroup] ([GroupId],[Id],[IsFull],[Name]) SELECT [GroupId],[Id],[IsFull],[Name] FROM [dbo].[SubGroup] WITH (holdlock tablockx)');
SET IDENTITY_INSERT [dbo].[_prisma_new_SubGroup] OFF;
DROP TABLE [dbo].[SubGroup];
EXEC SP_RENAME N'dbo._prisma_new_SubGroup', N'SubGroup';
DECLARE @SQL NVARCHAR(MAX) = N''
SELECT @SQL += N'ALTER TABLE '
    + QUOTENAME(OBJECT_SCHEMA_NAME(PARENT_OBJECT_ID))
    + '.'
    + QUOTENAME(OBJECT_NAME(PARENT_OBJECT_ID))
    + ' DROP CONSTRAINT '
    + OBJECT_NAME(OBJECT_ID) + ';'
FROM SYS.OBJECTS
WHERE TYPE_DESC LIKE '%CONSTRAINT'
    AND OBJECT_NAME(PARENT_OBJECT_ID) = 'Faculty'
    AND SCHEMA_NAME(SCHEMA_ID) = 'dbo'
EXEC sp_executesql @SQL
;
CREATE TABLE [dbo].[_prisma_new_Faculty] (
    [Id] INT NOT NULL IDENTITY(1,1),
    [Title] NVARCHAR(255) NOT NULL,
    CONSTRAINT [PK_Faculty] PRIMARY KEY CLUSTERED ([Id])
);
SET IDENTITY_INSERT [dbo].[_prisma_new_Faculty] ON;
IF EXISTS(SELECT * FROM [dbo].[Faculty])
    EXEC('INSERT INTO [dbo].[_prisma_new_Faculty] ([Id],[Title]) SELECT [Id],[Title] FROM [dbo].[Faculty] WITH (holdlock tablockx)');
SET IDENTITY_INSERT [dbo].[_prisma_new_Faculty] OFF;
DROP TABLE [dbo].[Faculty];
EXEC SP_RENAME N'dbo._prisma_new_Faculty', N'Faculty';
DECLARE @SQL NVARCHAR(MAX) = N''
SELECT @SQL += N'ALTER TABLE '
    + QUOTENAME(OBJECT_SCHEMA_NAME(PARENT_OBJECT_ID))
    + '.'
    + QUOTENAME(OBJECT_NAME(PARENT_OBJECT_ID))
    + ' DROP CONSTRAINT '
    + OBJECT_NAME(OBJECT_ID) + ';'
FROM SYS.OBJECTS
WHERE TYPE_DESC LIKE '%CONSTRAINT'
    AND OBJECT_NAME(PARENT_OBJECT_ID) = 'Subject'
    AND SCHEMA_NAME(SCHEMA_ID) = 'dbo'
EXEC sp_executesql @SQL
;
CREATE TABLE [dbo].[_prisma_new_Subject] (
    [Id] INT NOT NULL IDENTITY(1,1),
    [Name] NVARCHAR(255) NOT NULL,
    CONSTRAINT [PK_Subject] PRIMARY KEY CLUSTERED ([Id])
);
SET IDENTITY_INSERT [dbo].[_prisma_new_Subject] ON;
IF EXISTS(SELECT * FROM [dbo].[Subject])
    EXEC('INSERT INTO [dbo].[_prisma_new_Subject] ([Id],[Name]) SELECT [Id],[Name] FROM [dbo].[Subject] WITH (holdlock tablockx)');
SET IDENTITY_INSERT [dbo].[_prisma_new_Subject] OFF;
DROP TABLE [dbo].[Subject];
EXEC SP_RENAME N'dbo._prisma_new_Subject', N'Subject';
ALTER TABLE [dbo].[Student] DROP CONSTRAINT [IX_Student];
DECLARE @SQL NVARCHAR(MAX) = N''
SELECT @SQL += N'ALTER TABLE '
    + QUOTENAME(OBJECT_SCHEMA_NAME(PARENT_OBJECT_ID))
    + '.'
    + QUOTENAME(OBJECT_NAME(PARENT_OBJECT_ID))
    + ' DROP CONSTRAINT '
    + OBJECT_NAME(OBJECT_ID) + ';'
FROM SYS.OBJECTS
WHERE TYPE_DESC LIKE '%CONSTRAINT'
    AND OBJECT_NAME(PARENT_OBJECT_ID) = 'Student'
    AND SCHEMA_NAME(SCHEMA_ID) = 'dbo'
EXEC sp_executesql @SQL
;
CREATE TABLE [dbo].[_prisma_new_Student] (
    [Id] INT NOT NULL IDENTITY(1,1),
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
SET IDENTITY_INSERT [dbo].[_prisma_new_Student] ON;
IF EXISTS(SELECT * FROM [dbo].[Student])
    EXEC('INSERT INTO [dbo].[_prisma_new_Student] ([Email],[FirstName],[GroupId],[Id],[IsConfirmed],[IsRequested],[IsSenior],[LastName],[Password]) SELECT [Email],[FirstName],[GroupId],[Id],[IsConfirmed],[IsRequested],[IsSenior],[LastName],[Password] FROM [dbo].[Student] WITH (holdlock tablockx)');
SET IDENTITY_INSERT [dbo].[_prisma_new_Student] OFF;
DROP TABLE [dbo].[Student];
EXEC SP_RENAME N'dbo._prisma_new_Student', N'Student';
ALTER TABLE [dbo].[Group] DROP CONSTRAINT [IX_Group_1];
DECLARE @SQL NVARCHAR(MAX) = N''
SELECT @SQL += N'ALTER TABLE '
    + QUOTENAME(OBJECT_SCHEMA_NAME(PARENT_OBJECT_ID))
    + '.'
    + QUOTENAME(OBJECT_NAME(PARENT_OBJECT_ID))
    + ' DROP CONSTRAINT '
    + OBJECT_NAME(OBJECT_ID) + ';'
FROM SYS.OBJECTS
WHERE TYPE_DESC LIKE '%CONSTRAINT'
    AND OBJECT_NAME(PARENT_OBJECT_ID) = 'Group'
    AND SCHEMA_NAME(SCHEMA_ID) = 'dbo'
EXEC sp_executesql @SQL
;
CREATE TABLE [dbo].[_prisma_new_Group] (
    [Id] INT NOT NULL IDENTITY(1,1),
    [Name] NVARCHAR(255) NOT NULL,
    [HandlerId] INT,
    [FacultyId] INT NOT NULL,
    CONSTRAINT [PK_Group] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [IX_Group_1] UNIQUE NONCLUSTERED ([HandlerId])
);
SET IDENTITY_INSERT [dbo].[_prisma_new_Group] ON;
IF EXISTS(SELECT * FROM [dbo].[Group])
    EXEC('INSERT INTO [dbo].[_prisma_new_Group] ([FacultyId],[HandlerId],[Id],[Name]) SELECT [FacultyId],[HandlerId],[Id],[Name] FROM [dbo].[Group] WITH (holdlock tablockx)');
SET IDENTITY_INSERT [dbo].[_prisma_new_Group] OFF;
DROP TABLE [dbo].[Group];
EXEC SP_RENAME N'dbo._prisma_new_Group', N'Group';
DECLARE @SQL NVARCHAR(MAX) = N''
SELECT @SQL += N'ALTER TABLE '
    + QUOTENAME(OBJECT_SCHEMA_NAME(PARENT_OBJECT_ID))
    + '.'
    + QUOTENAME(OBJECT_NAME(PARENT_OBJECT_ID))
    + ' DROP CONSTRAINT '
    + OBJECT_NAME(OBJECT_ID) + ';'
FROM SYS.OBJECTS
WHERE TYPE_DESC LIKE '%CONSTRAINT'
    AND OBJECT_NAME(PARENT_OBJECT_ID) = 'Task'
    AND SCHEMA_NAME(SCHEMA_ID) = 'dbo'
EXEC sp_executesql @SQL
;
CREATE TABLE [dbo].[_prisma_new_Task] (
    [Id] INT NOT NULL IDENTITY(1,1),
    [DateCreated] DATETIME NOT NULL CONSTRAINT [DF_Task_DateCreated] DEFAULT CURRENT_TIMESTAMP,
    [Title] NVARCHAR(255),
    [SubClassId] INT NOT NULL,
    CONSTRAINT [PK_Task] PRIMARY KEY CLUSTERED ([Id])
);
SET IDENTITY_INSERT [dbo].[_prisma_new_Task] ON;
IF EXISTS(SELECT * FROM [dbo].[Task])
    EXEC('INSERT INTO [dbo].[_prisma_new_Task] ([DateCreated],[Id],[SubClassId],[Title]) SELECT [DateCreated],[Id],[SubClassId],[Title] FROM [dbo].[Task] WITH (holdlock tablockx)');
SET IDENTITY_INSERT [dbo].[_prisma_new_Task] OFF;
DROP TABLE [dbo].[Task];
EXEC SP_RENAME N'dbo._prisma_new_Task', N'Task';
DECLARE @SQL NVARCHAR(MAX) = N''
SELECT @SQL += N'ALTER TABLE '
    + QUOTENAME(OBJECT_SCHEMA_NAME(PARENT_OBJECT_ID))
    + '.'
    + QUOTENAME(OBJECT_NAME(PARENT_OBJECT_ID))
    + ' DROP CONSTRAINT '
    + OBJECT_NAME(OBJECT_ID) + ';'
FROM SYS.OBJECTS
WHERE TYPE_DESC LIKE '%CONSTRAINT'
    AND OBJECT_NAME(PARENT_OBJECT_ID) = 'SubClass'
    AND SCHEMA_NAME(SCHEMA_ID) = 'dbo'
EXEC sp_executesql @SQL
;
CREATE TABLE [dbo].[_prisma_new_SubClass] (
    [Id] INT NOT NULL IDENTITY(1,1),
    [SubGroupId] INT NOT NULL,
    [ClassId] INT NOT NULL,
    [TeacherId] INT,
    CONSTRAINT [PK_SubClass] PRIMARY KEY CLUSTERED ([Id])
);
SET IDENTITY_INSERT [dbo].[_prisma_new_SubClass] ON;
IF EXISTS(SELECT * FROM [dbo].[SubClass])
    EXEC('INSERT INTO [dbo].[_prisma_new_SubClass] ([ClassId],[Id],[SubGroupId],[TeacherId]) SELECT [ClassId],[Id],[SubGroupId],[TeacherId] FROM [dbo].[SubClass] WITH (holdlock tablockx)');
SET IDENTITY_INSERT [dbo].[_prisma_new_SubClass] OFF;
DROP TABLE [dbo].[SubClass];
EXEC SP_RENAME N'dbo._prisma_new_SubClass', N'SubClass';
COMMIT;

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
