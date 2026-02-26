-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "is_future_dated" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ClientDraft" ALTER COLUMN "emails" SET DEFAULT ARRAY[]::VARCHAR(55)[],
ALTER COLUMN "contacts" SET DEFAULT ARRAY[]::VARCHAR(50)[];

-- AlterTable
ALTER TABLE "Report" ALTER COLUMN "isins" SET DEFAULT ARRAY[]::VARCHAR(50)[];

-- AlterTable
ALTER TABLE "ReportDraft" ALTER COLUMN "isins" SET DEFAULT ARRAY[]::VARCHAR(50)[];

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "is_future_dated" BOOLEAN NOT NULL DEFAULT false;
