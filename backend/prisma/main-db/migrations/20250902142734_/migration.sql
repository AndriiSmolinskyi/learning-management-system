-- AlterTable
ALTER TABLE "Report" ALTER COLUMN "isins" SET DEFAULT ARRAY[]::VARCHAR(50)[];

-- AlterTable
ALTER TABLE "ReportDraft" ALTER COLUMN "isins" SET DEFAULT ARRAY[]::VARCHAR(50)[];

-- CreateIndex
CREATE INDEX "Asset_is_archived_idx" ON "Asset"("is_archived");

-- CreateIndex
CREATE INDEX "Asset_is_future_dated_idx" ON "Asset"("is_future_dated");

-- CreateIndex
CREATE INDEX "BondHistory_createdAt_idx" ON "BondHistory"("createdAt");

-- CreateIndex
CREATE INDEX "Client_is_activated_idx" ON "Client"("is_activated");

-- CreateIndex
CREATE INDEX "EquityHistory_createdAt_idx" ON "EquityHistory"("createdAt");

-- CreateIndex
CREATE INDEX "EtfHistory_createdAt_idx" ON "EtfHistory"("createdAt");
