/*
  Warnings:

  - You are about to drop the column `assetId` on the `TransactionType` table. All the data in the column will be lost.
  - You are about to drop the column `relatedTypeId` on the `TransactionType` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "TransactionType" DROP CONSTRAINT "TransactionType_assetId_fkey";

-- DropForeignKey
ALTER TABLE "TransactionType" DROP CONSTRAINT "TransactionType_relatedTypeId_fkey";

-- DropIndex
DROP INDEX "TransactionType_category_idx";

-- AlterTable
ALTER TABLE "Report" ALTER COLUMN "isins" SET DEFAULT ARRAY[]::VARCHAR(50)[];

-- AlterTable
ALTER TABLE "ReportDraft" ALTER COLUMN "isins" SET DEFAULT ARRAY[]::VARCHAR(50)[];

-- AlterTable
ALTER TABLE "TransactionType" DROP COLUMN "assetId",
DROP COLUMN "relatedTypeId",
ADD COLUMN     "asset_id" UUID,
ADD COLUMN     "category_id" UUID,
ADD COLUMN     "related_type_id" UUID,
ALTER COLUMN "category" DROP NOT NULL;

-- CreateTable
CREATE TABLE "TransactionTypeCategory" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransactionTypeCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AnnualAssets" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "TransactionTypeCategory_name_key" ON "TransactionTypeCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_AnnualAssets_AB_unique" ON "_AnnualAssets"("A", "B");

-- CreateIndex
CREATE INDEX "_AnnualAssets_B_index" ON "_AnnualAssets"("B");

-- CreateIndex
CREATE INDEX "TransactionType_category_id_idx" ON "TransactionType"("category_id");

-- CreateIndex
CREATE INDEX "TransactionType_related_type_id_idx" ON "TransactionType"("related_type_id");

-- CreateIndex
CREATE INDEX "TransactionType_asset_id_idx" ON "TransactionType"("asset_id");

-- AddForeignKey
ALTER TABLE "TransactionType" ADD CONSTRAINT "TransactionType_related_type_id_fkey" FOREIGN KEY ("related_type_id") REFERENCES "TransactionType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionType" ADD CONSTRAINT "TransactionType_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionType" ADD CONSTRAINT "TransactionType_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "TransactionTypeCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AnnualAssets" ADD CONSTRAINT "_AnnualAssets_A_fkey" FOREIGN KEY ("A") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AnnualAssets" ADD CONSTRAINT "_AnnualAssets_B_fkey" FOREIGN KEY ("B") REFERENCES "TransactionType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
