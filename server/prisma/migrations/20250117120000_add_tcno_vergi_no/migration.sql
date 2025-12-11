-- User tablosundan TC ve Vergi No alanlarını kaldır (eğer varsa)
ALTER TABLE "User" DROP COLUMN IF EXISTS "tcNo";
ALTER TABLE "User" DROP COLUMN IF EXISTS "vergiNo";

-- Business tablosuna TC ve Vergi No ekle
ALTER TABLE "Business" ADD COLUMN "tcNo" TEXT,
ADD COLUMN "vergiNo" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Business_tcNo_key" ON "Business"("tcNo");

-- CreateIndex
CREATE UNIQUE INDEX "Business_vergiNo_key" ON "Business"("vergiNo");

