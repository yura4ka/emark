-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN     "confirmString" TEXT,
ADD COLUMN     "requestDate" TIMESTAMP(3),
ALTER COLUMN "isRequested" SET DEFAULT true;
