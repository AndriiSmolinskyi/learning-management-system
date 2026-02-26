-- CreateEnum
CREATE TYPE "CryptoType" AS ENUM ('DirectHold', 'ETF');

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "assetBondGroupId" UUID,
ADD COLUMN     "assetCryptoGroupId" UUID;

-- AlterTable
ALTER TABLE "Report" ALTER COLUMN "isins" SET DEFAULT ARRAY[]::VARCHAR(50)[];

-- AlterTable
ALTER TABLE "ReportDraft" ALTER COLUMN "isins" SET DEFAULT ARRAY[]::VARCHAR(50)[];

-- AlterTable
ALTER TABLE "Request" ADD COLUMN     "assetBondGroupId" UUID;

-- AlterTable
ALTER TABLE "RequestDraft" ADD COLUMN     "assetBondGroupId" UUID;

-- CreateTable
CREATE TABLE "AssetBondGroup" (
    "id" UUID NOT NULL,
    "accountId" UUID NOT NULL,
    "currency" TEXT NOT NULL,
    "isin" TEXT,
    "total_units" DOUBLE PRECISION NOT NULL,
    "asset_name" VARCHAR(50) NOT NULL,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cost_price" DOUBLE PRECISION NOT NULL,
    "cost_value_fc" DOUBLE PRECISION NOT NULL,
    "cost_value_usd" DOUBLE PRECISION NOT NULL,
    "market_value_fc" DOUBLE PRECISION NOT NULL,
    "market_value_usd" DOUBLE PRECISION NOT NULL,
    "profit_usd" DOUBLE PRECISION NOT NULL,
    "profit_percentage" DOUBLE PRECISION NOT NULL,
    "portfolioId" UUID,
    "portfolioDraftId" UUID,
    "entityId" UUID NOT NULL,
    "bankId" UUID NOT NULL,
    "clientId" UUID NOT NULL,

    CONSTRAINT "AssetBondGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetBond" (
    "id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "portfolio_id" UUID,
    "portfolio_draft_id" UUID,
    "entity_id" UUID NOT NULL,
    "bank_id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "asset_name" VARCHAR(50) NOT NULL,
    "currency" "CurrencyDataList" NOT NULL,
    "security" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "value_date" TIMESTAMP(3) NOT NULL,
    "isin" TEXT NOT NULL,
    "units" DOUBLE PRECISION NOT NULL,
    "unit_price" DOUBLE PRECISION NOT NULL,
    "bank_fee" DOUBLE PRECISION NOT NULL,
    "accrued" DOUBLE PRECISION NOT NULL,
    "cost_price" DOUBLE PRECISION NOT NULL,
    "cost_value_fc" DOUBLE PRECISION NOT NULL,
    "cost_value_usd" DOUBLE PRECISION NOT NULL,
    "market_value_fc" DOUBLE PRECISION NOT NULL,
    "market_value_usd" DOUBLE PRECISION NOT NULL,
    "profit_usd" DOUBLE PRECISION NOT NULL,
    "profit_percentage" DOUBLE PRECISION NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "is_future_dated" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "groupId" UUID NOT NULL,

    CONSTRAINT "AssetBond_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AssetBondGroup_portfolioId_idx" ON "AssetBondGroup"("portfolioId");

-- CreateIndex
CREATE INDEX "AssetBondGroup_portfolioDraftId_idx" ON "AssetBondGroup"("portfolioDraftId");

-- CreateIndex
CREATE INDEX "AssetBondGroup_entityId_idx" ON "AssetBondGroup"("entityId");

-- CreateIndex
CREATE INDEX "AssetBondGroup_bankId_idx" ON "AssetBondGroup"("bankId");

-- CreateIndex
CREATE INDEX "AssetBondGroup_accountId_idx" ON "AssetBondGroup"("accountId");

-- CreateIndex
CREATE INDEX "AssetBondGroup_clientId_idx" ON "AssetBondGroup"("clientId");

-- CreateIndex
CREATE INDEX "AssetBondGroup_asset_name_idx" ON "AssetBondGroup"("asset_name");

-- CreateIndex
CREATE INDEX "AssetBondGroup_is_archived_idx" ON "AssetBondGroup"("is_archived");

-- CreateIndex
CREATE UNIQUE INDEX "AssetBondGroup_accountId_currency_isin_key" ON "AssetBondGroup"("accountId", "currency", "isin");

-- CreateIndex
CREATE UNIQUE INDEX "AssetBond_id_key" ON "AssetBond"("id");

-- CreateIndex
CREATE INDEX "AssetBond_portfolio_id_idx" ON "AssetBond"("portfolio_id");

-- CreateIndex
CREATE INDEX "AssetBond_portfolio_draft_id_idx" ON "AssetBond"("portfolio_draft_id");

-- CreateIndex
CREATE INDEX "AssetBond_entity_id_idx" ON "AssetBond"("entity_id");

-- CreateIndex
CREATE INDEX "AssetBond_bank_id_idx" ON "AssetBond"("bank_id");

-- CreateIndex
CREATE INDEX "AssetBond_account_id_idx" ON "AssetBond"("account_id");

-- CreateIndex
CREATE INDEX "AssetBond_client_id_idx" ON "AssetBond"("client_id");

-- CreateIndex
CREATE INDEX "AssetBond_asset_name_idx" ON "AssetBond"("asset_name");

-- CreateIndex
CREATE INDEX "AssetBond_is_future_dated_idx" ON "AssetBond"("is_future_dated");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_assetBondGroupId_fkey" FOREIGN KEY ("assetBondGroupId") REFERENCES "AssetBondGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_assetBondGroupId_fkey" FOREIGN KEY ("assetBondGroupId") REFERENCES "AssetBondGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestDraft" ADD CONSTRAINT "RequestDraft_assetBondGroupId_fkey" FOREIGN KEY ("assetBondGroupId") REFERENCES "AssetBondGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetBondGroup" ADD CONSTRAINT "AssetBondGroup_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetBondGroup" ADD CONSTRAINT "AssetBondGroup_portfolioDraftId_fkey" FOREIGN KEY ("portfolioDraftId") REFERENCES "PortfolioDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetBondGroup" ADD CONSTRAINT "AssetBondGroup_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetBondGroup" ADD CONSTRAINT "AssetBondGroup_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "Bank"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetBondGroup" ADD CONSTRAINT "AssetBondGroup_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetBondGroup" ADD CONSTRAINT "AssetBondGroup_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetBond" ADD CONSTRAINT "AssetBond_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "AssetBondGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
