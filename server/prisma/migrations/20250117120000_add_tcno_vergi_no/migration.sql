-- AlterTable
ALTER TABLE "User" ADD COLUMN "tcNo" TEXT,
ADD COLUMN "vergiNo" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_tcNo_key" ON "User"("tcNo");

-- CreateIndex
CREATE UNIQUE INDEX "User_vergiNo_key" ON "User"("vergiNo");

