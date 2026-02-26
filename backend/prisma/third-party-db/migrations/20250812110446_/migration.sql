/*
  Warnings:

  - You are about to drop the `DocumentType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ServiceProvidersList` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "DocumentType";

-- DropTable
DROP TABLE "ServiceProvidersList";

-- CreateIndex
CREATE INDEX "CBonds_created_at_idx" ON "CBonds"("created_at");
