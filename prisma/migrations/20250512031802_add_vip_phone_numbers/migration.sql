-- CreateTable
CREATE TABLE "VIPPhoneNumber" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "teamId" TEXT NOT NULL,

    CONSTRAINT "VIPPhoneNumber_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VIPPhoneNumber_phoneNumber_idx" ON "VIPPhoneNumber"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "VIPPhoneNumber_teamId_phoneNumber_key" ON "VIPPhoneNumber"("teamId", "phoneNumber");

-- AddForeignKey
ALTER TABLE "VIPPhoneNumber" ADD CONSTRAINT "VIPPhoneNumber_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
