-- AlterTable
ALTER TABLE "Report" ALTER COLUMN "isins" SET DEFAULT ARRAY[]::VARCHAR(50)[];

-- AlterTable
ALTER TABLE "ReportDraft" ALTER COLUMN "isins" SET DEFAULT ARRAY[]::VARCHAR(50)[];

-- CreateTable
CREATE TABLE "AssetDeposit" (
    "id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "portfolio_id" UUID,
    "portfolio_draft_id" UUID,
    "entity_id" UUID NOT NULL,
    "bank_id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "asset_name" VARCHAR(50) NOT NULL,
    "currency" "CurrencyDataList" NOT NULL,
    "interest" DOUBLE PRECISION NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "policy" TEXT NOT NULL,
    "currencyValue" DOUBLE PRECISION NOT NULL,
    "toBeMatured" BOOLEAN NOT NULL,
    "comment" TEXT,
    "rate" DOUBLE PRECISION NOT NULL,
    "is_future_dated" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssetDeposit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AssetDeposit_id_key" ON "AssetDeposit"("id");

-- CreateIndex
CREATE INDEX "AssetDeposit_portfolio_id_idx" ON "AssetDeposit"("portfolio_id");

-- CreateIndex
CREATE INDEX "AssetDeposit_portfolio_draft_id_idx" ON "AssetDeposit"("portfolio_draft_id");

-- CreateIndex
CREATE INDEX "AssetDeposit_entity_id_idx" ON "AssetDeposit"("entity_id");

-- CreateIndex
CREATE INDEX "AssetDeposit_bank_id_idx" ON "AssetDeposit"("bank_id");

-- CreateIndex
CREATE INDEX "AssetDeposit_account_id_idx" ON "AssetDeposit"("account_id");

-- CreateIndex
CREATE INDEX "AssetDeposit_client_id_idx" ON "AssetDeposit"("client_id");

-- CreateIndex
CREATE INDEX "AssetDeposit_asset_name_idx" ON "AssetDeposit"("asset_name");

-- CreateIndex
CREATE INDEX "AssetDeposit_is_future_dated_idx" ON "AssetDeposit"("is_future_dated");

-- AddForeignKey
ALTER TABLE "AssetDeposit" ADD CONSTRAINT "AssetDeposit_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetDeposit" ADD CONSTRAINT "AssetDeposit_portfolio_draft_id_fkey" FOREIGN KEY ("portfolio_draft_id") REFERENCES "PortfolioDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetDeposit" ADD CONSTRAINT "AssetDeposit_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetDeposit" ADD CONSTRAINT "AssetDeposit_bank_id_fkey" FOREIGN KEY ("bank_id") REFERENCES "Bank"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetDeposit" ADD CONSTRAINT "AssetDeposit_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
