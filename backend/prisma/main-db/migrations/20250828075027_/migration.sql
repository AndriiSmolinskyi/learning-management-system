/*
  Warnings:

  - You are about to drop the column `asset_id` on the `TransactionType` table. All the data in the column will be lost.
  - You are about to drop the `_AnnualAssets` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TransactionType" DROP CONSTRAINT "TransactionType_asset_id_fkey";

-- DropForeignKey
ALTER TABLE "_AnnualAssets" DROP CONSTRAINT "_AnnualAssets_A_fkey";

-- DropForeignKey
ALTER TABLE "_AnnualAssets" DROP CONSTRAINT "_AnnualAssets_B_fkey";

-- DropIndex
DROP INDEX "TransactionType_asset_id_idx";

-- AlterTable
ALTER TABLE "Report" ALTER COLUMN "isins" SET DEFAULT ARRAY[]::VARCHAR(50)[];

-- AlterTable
ALTER TABLE "ReportDraft" ALTER COLUMN "isins" SET DEFAULT ARRAY[]::VARCHAR(50)[];

-- AlterTable
ALTER TABLE "TransactionType" DROP COLUMN "asset_id",
ADD COLUMN     "annualAssets" TEXT[],
ADD COLUMN     "asset" TEXT;

-- DropTable
DROP TABLE "_AnnualAssets";

-- CreateTable
CREATE TABLE "TransactionTypeDraft" (
    "id" UUID NOT NULL,
    "name" TEXT,
    "category" TEXT,
    "cash_flow" TEXT,
    "pl" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "counter" INTEGER NOT NULL DEFAULT 0,
    "comment" TEXT,
    "asset" TEXT,
    "category_id" UUID,
    "annualAssets" TEXT[],

    CONSTRAINT "TransactionTypeDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TransactionTypeDraft_id_key" ON "TransactionTypeDraft"("id");

-- CreateIndex
CREATE INDEX "TransactionTypeDraft_name_idx" ON "TransactionTypeDraft"("name");

-- CreateIndex
CREATE INDEX "TransactionTypeDraft_category_id_idx" ON "TransactionTypeDraft"("category_id");

-- AddForeignKey
ALTER TABLE "TransactionTypeDraft" ADD CONSTRAINT "TransactionTypeDraft_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "TransactionTypeCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
