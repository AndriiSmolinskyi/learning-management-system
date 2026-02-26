/*
  Warnings:

  - You are about to drop the column `annualAssets` on the `TransactionType` table. All the data in the column will be lost.
  - You are about to drop the column `category_id` on the `TransactionType` table. All the data in the column will be lost.
  - You are about to drop the column `comment` on the `TransactionType` table. All the data in the column will be lost.
  - Added the required column `transaction_type_version_id` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transaction_type_version_id` to the `TransactionDraft` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TransactionType" DROP CONSTRAINT "TransactionType_category_id_fkey";

-- DropIndex
DROP INDEX "TransactionType_category_id_idx";

-- DropIndex
DROP INDEX "TransactionType_id_key";

-- DropIndex
DROP INDEX "TransactionType_name_idx";

-- AlterTable
ALTER TABLE "Report" ALTER COLUMN "isins" SET DEFAULT ARRAY[]::VARCHAR(50)[];

-- AlterTable
ALTER TABLE "ReportDraft" ALTER COLUMN "isins" SET DEFAULT ARRAY[]::VARCHAR(50)[];

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "transaction_type_version_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "TransactionDraft" ADD COLUMN     "transaction_type_version_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "TransactionType" DROP COLUMN "annualAssets",
DROP COLUMN "category_id",
DROP COLUMN "comment",
ADD COLUMN     "isActivated" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "transactionTypeCategoryId" UUID,
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "cash_flow" DROP NOT NULL;

-- CreateTable
CREATE TABLE "TransactionTypeAuditTrail" (
    "id" UUID NOT NULL,
    "userName" TEXT,
    "userRole" TEXT,
    "settingsType" TEXT,
    "transactionTypeNameFrom" TEXT,
    "transactionTypeNameTo" TEXT,
    "transactionTypeCategoryFrom" TEXT,
    "transactionTypeCategoryTo" TEXT,
    "transactionTypeCashflowFrom" TEXT,
    "transactionTypeCashflowTo" TEXT,
    "transactionTypePlFrom" TEXT,
    "transactionTypePlTo" TEXT,
    "transactionTypeAnnualFrom" TEXT[],
    "transactionTypeAnnualTo" TEXT[],
    "transactionTypeCommentFrom" TEXT,
    "transactionTypeCommentTo" TEXT,
    "transactionTypeRelatedTypeFrom" TEXT,
    "transactionTypeRelatedTypeTo" TEXT,
    "transactionTypeRelatedAssetFrom" TEXT,
    "transactionTypeRelatedAssetTo" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transaction_type_id" UUID,

    CONSTRAINT "TransactionTypeAuditTrail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransactionTypeVersion" (
    "id" UUID NOT NULL,
    "type_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "category_id" UUID,
    "cash_flow" TEXT NOT NULL,
    "pl" TEXT,
    "annualAssets" TEXT[],
    "comment" TEXT,
    "is_current" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransactionTypeVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TransactionTypeAuditTrail_id_key" ON "TransactionTypeAuditTrail"("id");

-- CreateIndex
CREATE INDEX "TransactionTypeAuditTrail_transaction_type_id_idx" ON "TransactionTypeAuditTrail"("transaction_type_id");

-- CreateIndex
CREATE INDEX "TransactionTypeVersion_type_id_is_current_idx" ON "TransactionTypeVersion"("type_id", "is_current");

-- CreateIndex
CREATE INDEX "TransactionTypeVersion_category_id_idx" ON "TransactionTypeVersion"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "TransactionTypeVersion_type_id_version_key" ON "TransactionTypeVersion"("type_id", "version");

-- CreateIndex
CREATE INDEX "Transaction_transaction_type_version_id_idx" ON "Transaction"("transaction_type_version_id");

-- CreateIndex
CREATE INDEX "TransactionType_isActivated_idx" ON "TransactionType"("isActivated");

-- CreateIndex
CREATE INDEX "TransactionType_isDeleted_idx" ON "TransactionType"("isDeleted");

-- AddForeignKey
ALTER TABLE "TransactionTypeAuditTrail" ADD CONSTRAINT "TransactionTypeAuditTrail_transaction_type_id_fkey" FOREIGN KEY ("transaction_type_id") REFERENCES "TransactionType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionTypeVersion" ADD CONSTRAINT "TransactionTypeVersion_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "TransactionType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionTypeVersion" ADD CONSTRAINT "TransactionTypeVersion_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "TransactionTypeCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionType" ADD CONSTRAINT "TransactionType_transactionTypeCategoryId_fkey" FOREIGN KEY ("transactionTypeCategoryId") REFERENCES "TransactionTypeCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_transaction_type_version_id_fkey" FOREIGN KEY ("transaction_type_version_id") REFERENCES "TransactionTypeVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionDraft" ADD CONSTRAINT "TransactionDraft_transaction_type_version_id_fkey" FOREIGN KEY ("transaction_type_version_id") REFERENCES "TransactionTypeVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
