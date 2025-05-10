/*
  Warnings:

  - Added the required column `s3Key` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teamId` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "s3Key" TEXT NOT NULL,
ADD COLUMN     "teamId" TEXT NOT NULL,
ADD COLUMN     "vectorized" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "vectorizedAt" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
