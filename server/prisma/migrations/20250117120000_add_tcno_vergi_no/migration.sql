-- AlterTable
ALTER TABLE "Business" ADD COLUMN "tcNo" TEXT,
ADD COLUMN "vergiNo" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Business_tcNo_key" ON "Business"("tcNo");

-- CreateIndex
CREATE UNIQUE INDEX "Business_vergiNo_key" ON "Business"("vergiNo");

