-- DropForeignKey
ALTER TABLE "TransactionType" DROP CONSTRAINT "TransactionType_transactionTypeCategoryId_fkey";

-- AlterTable
ALTER TABLE "Report" ALTER COLUMN "isins" SET DEFAULT ARRAY[]::VARCHAR(50)[];

-- AlterTable
ALTER TABLE "ReportDraft" ALTER COLUMN "isins" SET DEFAULT ARRAY[]::VARCHAR(50)[];

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "transaction_type_version_id" DROP NOT NULL;
