-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "companyId" TEXT,
ADD COLUMN     "processImmediately" BOOLEAN NOT NULL DEFAULT true;
