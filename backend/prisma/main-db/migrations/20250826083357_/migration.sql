-- AlterTable
ALTER TABLE "Report" ALTER COLUMN "isins" SET DEFAULT ARRAY[]::VARCHAR(50)[];

-- AlterTable
ALTER TABLE "ReportDraft" ALTER COLUMN "isins" SET DEFAULT ARRAY[]::VARCHAR(50)[];

-- AlterTable
ALTER TABLE "TransactionType" ADD COLUMN     "assetId" UUID,
ADD COLUMN     "relatedTypeId" UUID;

-- AddForeignKey
ALTER TABLE "TransactionType" ADD CONSTRAINT "TransactionType_relatedTypeId_fkey" FOREIGN KEY ("relatedTypeId") REFERENCES "TransactionType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionType" ADD CONSTRAINT "TransactionType_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
