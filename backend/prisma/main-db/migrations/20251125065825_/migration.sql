/*
  Warnings:

  - You are about to drop the column `portfolio_draft_id` on the `AssetBond` table. All the data in the column will be lost.
  - You are about to drop the column `portfolioDraftId` on the `AssetBondGroup` table. All the data in the column will be lost.
  - You are about to drop the column `client_id` on the `AssetDeposit` table. All the data in the column will be lost.
  - You are about to drop the column `currencyValue` on the `AssetDeposit` table. All the data in the column will be lost.
  - You are about to drop the column `portfolio_draft_id` on the `AssetDeposit` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `AssetDeposit` table. All the data in the column will be lost.
  - You are about to drop the column `toBeMatured` on the `AssetDeposit` table. All the data in the column will be lost.
  - You are about to drop the column `assetBondGroupId` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `assetCryptoGroupId` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `assetBondGroupId` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `assetBondGroupId` on the `RequestDraft` table. All the data in the column will be lost.
  - You are about to drop the column `cash_flow` on the `TransactionType` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `TransactionType` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `TransactionType` table. All the data in the column will be lost.
  - You are about to drop the column `pl` on the `TransactionType` table. All the data in the column will be lost.
  - Added the required column `market_price` to the `AssetBond` table without a default value. This is not possible if the table is not empty.
  - Added the required column `yield` to the `AssetBond` table without a default value. This is not possible if the table is not empty.
  - Made the column `portfolio_id` on table `AssetBond` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `accrued` to the `AssetBondGroup` table without a default value. This is not possible if the table is not empty.
  - Added the required column `market_price` to the `AssetBondGroup` table without a default value. This is not possible if the table is not empty.
  - Added the required column `security` to the `AssetBondGroup` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value_date` to the `AssetBondGroup` table without a default value. This is not possible if the table is not empty.
  - Added the required column `yield` to the `AssetBondGroup` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `currency` on the `AssetBondGroup` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `isin` on table `AssetBondGroup` required. This step will fail if there are existing NULL values in that column.
  - Made the column `portfolioId` on table `AssetBondGroup` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `clientId` to the `AssetDeposit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currency_value` to the `AssetDeposit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_date` to the `AssetDeposit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `to_be_matured` to the `AssetDeposit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usd_value` to the `AssetDeposit` table without a default value. This is not possible if the table is not empty.
  - Made the column `portfolio_id` on table `AssetDeposit` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `price_type` to the `OrderDetails` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DeleteInstance" AS ENUM ('Client', 'Portfolio', 'Budget', 'Asset', 'Transaction');

-- CreateEnum
CREATE TYPE "EquityType" AS ENUM ('Equity', 'ETF');

-- DropForeignKey
ALTER TABLE "AssetBondGroup" DROP CONSTRAINT "AssetBondGroup_portfolioDraftId_fkey";

-- DropForeignKey
ALTER TABLE "AssetDeposit" DROP CONSTRAINT "AssetDeposit_portfolio_draft_id_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_assetBondGroupId_fkey";

-- DropForeignKey
ALTER TABLE "Request" DROP CONSTRAINT "Request_assetBondGroupId_fkey";

-- DropForeignKey
ALTER TABLE "RequestDraft" DROP CONSTRAINT "RequestDraft_assetBondGroupId_fkey";

-- DropIndex
DROP INDEX "AssetBond_portfolio_draft_id_idx";

-- DropIndex
DROP INDEX "AssetBondGroup_portfolioDraftId_idx";

-- DropIndex
DROP INDEX "AssetDeposit_client_id_idx";

-- DropIndex
DROP INDEX "AssetDeposit_portfolio_draft_id_idx";

-- AlterTable
ALTER TABLE "AssetBond" DROP COLUMN "portfolio_draft_id",
ADD COLUMN     "comment" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "coupon" TEXT,
ADD COLUMN     "issuer" TEXT,
ADD COLUMN     "market_price" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "maturity_date" TIMESTAMP(3),
ADD COLUMN     "next_coupon_date" TIMESTAMP(3),
ADD COLUMN     "sector" TEXT,
ADD COLUMN     "yield" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "portfolio_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "AssetBondGroup" DROP COLUMN "portfolioDraftId",
ADD COLUMN     "accrued" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "avg_rate" DOUBLE PRECISION NOT NULL DEFAULT 1,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "coupon" TEXT,
ADD COLUMN     "issuer" TEXT,
ADD COLUMN     "market_price" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "maturity_date" TIMESTAMP(3),
ADD COLUMN     "next_coupon_date" TIMESTAMP(3),
ADD COLUMN     "sector" TEXT,
ADD COLUMN     "security" TEXT NOT NULL,
ADD COLUMN     "transactionId" INTEGER,
ADD COLUMN     "value_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "yield" DOUBLE PRECISION NOT NULL,
DROP COLUMN "currency",
ADD COLUMN     "currency" "CurrencyDataList" NOT NULL,
ALTER COLUMN "isin" SET NOT NULL,
ALTER COLUMN "portfolioId" SET NOT NULL;

-- AlterTable
ALTER TABLE "AssetDeposit" DROP COLUMN "client_id",
DROP COLUMN "currencyValue",
DROP COLUMN "portfolio_draft_id",
DROP COLUMN "startDate",
DROP COLUMN "toBeMatured",
ADD COLUMN     "clientId" UUID NOT NULL,
ADD COLUMN     "currency_value" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "is_archived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maturity_date" TIMESTAMP(3),
ADD COLUMN     "start_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "to_be_matured" BOOLEAN NOT NULL,
ADD COLUMN     "transactionId" INTEGER,
ADD COLUMN     "usd_value" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "portfolio_id" SET NOT NULL,
ALTER COLUMN "asset_name" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Document" DROP COLUMN "assetBondGroupId",
DROP COLUMN "assetCryptoGroupId",
ADD COLUMN     "assetBondId" UUID,
ADD COLUMN     "assetCashId" UUID,
ADD COLUMN     "assetCryptoId" UUID,
ADD COLUMN     "assetDepositId" UUID,
ADD COLUMN     "assetEquityId" UUID,
ADD COLUMN     "assetLoanId" UUID,
ADD COLUMN     "assetMetalId" UUID,
ADD COLUMN     "assetOptionId" UUID,
ADD COLUMN     "assetOtherInvestmentId" UUID,
ADD COLUMN     "assetPrivateEquityId" UUID,
ADD COLUMN     "assetRealEstateId" UUID;

-- AlterTable
ALTER TABLE "OrderDetails" ADD COLUMN     "price_type" VARCHAR(50) NOT NULL,
ADD COLUMN     "yield" VARCHAR(50),
ALTER COLUMN "unit_executed" DROP NOT NULL,
ALTER COLUMN "unit_executed" DROP DEFAULT;

-- AlterTable
ALTER TABLE "OrderDraftDetails" ADD COLUMN     "price_type" VARCHAR(50),
ADD COLUMN     "yield" VARCHAR(50);

-- AlterTable
ALTER TABLE "Report" ALTER COLUMN "isins" SET DEFAULT ARRAY[]::VARCHAR(50)[];

-- AlterTable
ALTER TABLE "ReportDraft" ALTER COLUMN "isins" SET DEFAULT ARRAY[]::VARCHAR(50)[];

-- AlterTable
ALTER TABLE "Request" DROP COLUMN "assetBondGroupId",
ADD COLUMN     "assetBondId" UUID,
ADD COLUMN     "assetEquityId" UUID;

-- AlterTable
ALTER TABLE "RequestDraft" DROP COLUMN "assetBondGroupId",
ADD COLUMN     "assetBondId" UUID,
ADD COLUMN     "assetEquityId" UUID;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "assetBondId" UUID,
ADD COLUMN     "assetCryptoId" UUID,
ADD COLUMN     "assetDepositId" UUID,
ADD COLUMN     "assetEquityId" UUID,
ADD COLUMN     "assetLoanId" UUID,
ADD COLUMN     "assetMetalGroupId" UUID,
ADD COLUMN     "assetMetalId" UUID,
ADD COLUMN     "assetOptionId" UUID,
ADD COLUMN     "assetOtherInvestmentId" UUID,
ADD COLUMN     "assetPrivateEquityId" UUID,
ADD COLUMN     "assetRealEstateId" UUID,
ADD COLUMN     "asset_id" UUID,
ADD COLUMN     "equityId" INTEGER;

-- AlterTable
ALTER TABLE "TransactionType" DROP COLUMN "cash_flow",
DROP COLUMN "category",
DROP COLUMN "name",
DROP COLUMN "pl";

-- AlterTable
ALTER TABLE "TransactionTypeCategory" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "AssetEquityGroup" (
    "id" UUID NOT NULL,
    "currency" "CurrencyDataList" NOT NULL,
    "isin" TEXT NOT NULL,
    "security" TEXT NOT NULL,
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
    "issuer" TEXT,
    "sector" TEXT,
    "country" TEXT,
    "current_stock_price" DOUBLE PRECISION NOT NULL,
    "transaction_date" TIMESTAMP(3) NOT NULL,
    "avg_rate" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "type" "EquityType" NOT NULL,
    "portfolioId" UUID NOT NULL,
    "entityId" UUID NOT NULL,
    "bankId" UUID NOT NULL,
    "accountId" UUID NOT NULL,
    "clientId" UUID NOT NULL,
    "transactionId" INTEGER,

    CONSTRAINT "AssetEquityGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetEquity" (
    "id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "portfolio_id" UUID NOT NULL,
    "entity_id" UUID NOT NULL,
    "bank_id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "asset_name" TEXT NOT NULL,
    "currency" "CurrencyDataList" NOT NULL,
    "transaction_date" TIMESTAMP(3) NOT NULL,
    "transaction_price" DOUBLE PRECISION NOT NULL,
    "security" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "isin" TEXT NOT NULL,
    "units" DOUBLE PRECISION NOT NULL,
    "bank_fee" DOUBLE PRECISION NOT NULL,
    "equity_type" TEXT NOT NULL,
    "comment" TEXT,
    "cost_price" DOUBLE PRECISION NOT NULL,
    "cost_value_fc" DOUBLE PRECISION NOT NULL,
    "cost_value_usd" DOUBLE PRECISION NOT NULL,
    "market_value_fc" DOUBLE PRECISION NOT NULL,
    "market_value_usd" DOUBLE PRECISION NOT NULL,
    "profit_usd" DOUBLE PRECISION NOT NULL,
    "profit_percentage" DOUBLE PRECISION NOT NULL,
    "issuer" TEXT,
    "sector" TEXT,
    "country" TEXT,
    "current_stock_price" DOUBLE PRECISION NOT NULL,
    "type" "EquityType" NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "is_future_dated" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "groupId" UUID NOT NULL,

    CONSTRAINT "AssetEquity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetCryptoGroup" (
    "id" UUID NOT NULL,
    "product_type" TEXT NOT NULL,
    "asset_name" VARCHAR(50) NOT NULL,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cost_price" DOUBLE PRECISION,
    "cost_value_fc" DOUBLE PRECISION NOT NULL,
    "cost_value_usd" DOUBLE PRECISION NOT NULL,
    "market_value_fc" DOUBLE PRECISION NOT NULL,
    "market_value_usd" DOUBLE PRECISION NOT NULL,
    "profit_usd" DOUBLE PRECISION NOT NULL,
    "profit_percentage" DOUBLE PRECISION NOT NULL,
    "avg_rate" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "currency" "CurrencyDataList",
    "isin" TEXT,
    "security" TEXT,
    "issuer" TEXT,
    "sector" TEXT,
    "country" TEXT,
    "total_units" DOUBLE PRECISION,
    "current_stock_price" DOUBLE PRECISION,
    "transaction_date" TIMESTAMP(3),
    "transaction_price" DOUBLE PRECISION,
    "type" "EquityType",
    "exchange_wallet" TEXT,
    "crypto_currency_type" TEXT,
    "crypto_amount" DOUBLE PRECISION,
    "purchase_date" TIMESTAMP(3),
    "purchase_price" DOUBLE PRECISION,
    "portfolioId" UUID NOT NULL,
    "entityId" UUID NOT NULL,
    "bankId" UUID NOT NULL,
    "accountId" UUID NOT NULL,
    "clientId" UUID NOT NULL,
    "transactionId" INTEGER,

    CONSTRAINT "AssetCryptoGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetCrypto" (
    "id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "portfolio_id" UUID NOT NULL,
    "entity_id" UUID NOT NULL,
    "bank_id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "asset_name" TEXT NOT NULL,
    "product_type" TEXT NOT NULL,
    "currency" "CurrencyDataList",
    "transaction_date" TIMESTAMP(3),
    "transaction_price" DOUBLE PRECISION,
    "security" TEXT,
    "operation" TEXT,
    "isin" TEXT,
    "units" DOUBLE PRECISION,
    "bank_fee" DOUBLE PRECISION,
    "type" "EquityType",
    "comment" TEXT,
    "crypto_amount" DOUBLE PRECISION,
    "exchange_wallet" TEXT,
    "purchase_date" TIMESTAMP(3),
    "purchase_price" DOUBLE PRECISION,
    "crypto_currency_type" "CryptoList",
    "cost_value_fc" DOUBLE PRECISION NOT NULL,
    "cost_value_usd" DOUBLE PRECISION NOT NULL,
    "market_value_fc" DOUBLE PRECISION NOT NULL,
    "market_value_usd" DOUBLE PRECISION NOT NULL,
    "profit_usd" DOUBLE PRECISION NOT NULL,
    "profit_percentage" DOUBLE PRECISION NOT NULL,
    "issuer" TEXT,
    "sector" TEXT,
    "country" TEXT,
    "cost_price" DOUBLE PRECISION,
    "current_stock_price" DOUBLE PRECISION,
    "rate" DOUBLE PRECISION NOT NULL,
    "is_future_dated" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "groupId" UUID NOT NULL,

    CONSTRAINT "AssetCrypto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetMetalGroup" (
    "id" UUID NOT NULL,
    "product_type" TEXT NOT NULL,
    "asset_name" VARCHAR(50) NOT NULL,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cost_price" DOUBLE PRECISION NOT NULL,
    "cost_value_fc" DOUBLE PRECISION NOT NULL,
    "cost_value_usd" DOUBLE PRECISION NOT NULL,
    "market_value_fc" DOUBLE PRECISION NOT NULL,
    "market_value_usd" DOUBLE PRECISION NOT NULL,
    "profit_usd" DOUBLE PRECISION NOT NULL,
    "profit_percentage" DOUBLE PRECISION NOT NULL,
    "avg_rate" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "currency" "CurrencyDataList" NOT NULL,
    "total_units" DOUBLE PRECISION NOT NULL,
    "transaction_date" TIMESTAMP(3) NOT NULL,
    "transaction_price" DOUBLE PRECISION NOT NULL,
    "isin" TEXT,
    "current_stock_price" DOUBLE PRECISION NOT NULL,
    "security" TEXT,
    "issuer" TEXT,
    "sector" TEXT,
    "country" TEXT,
    "type" "EquityType",
    "metal_type" "MetalDataList",
    "metal_name" TEXT,
    "metal_price" DOUBLE PRECISION,
    "portfolioId" UUID NOT NULL,
    "entityId" UUID NOT NULL,
    "bankId" UUID NOT NULL,
    "accountId" UUID NOT NULL,
    "clientId" UUID NOT NULL,
    "transactionId" INTEGER,

    CONSTRAINT "AssetMetalGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetMetal" (
    "id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "portfolio_id" UUID NOT NULL,
    "entity_id" UUID NOT NULL,
    "bank_id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "asset_name" TEXT NOT NULL,
    "product_type" TEXT NOT NULL,
    "comment" TEXT,
    "currency" "CurrencyDataList" NOT NULL,
    "operation" TEXT NOT NULL,
    "transaction_date" TIMESTAMP(3) NOT NULL,
    "transaction_price" DOUBLE PRECISION NOT NULL,
    "units" DOUBLE PRECISION NOT NULL,
    "security" TEXT,
    "isin" TEXT,
    "bank_fee" DOUBLE PRECISION,
    "type" "EquityType",
    "metal_type" "MetalDataList",
    "metal_name" TEXT,
    "metal_price" DOUBLE PRECISION,
    "cost_value_fc" DOUBLE PRECISION NOT NULL,
    "cost_value_usd" DOUBLE PRECISION NOT NULL,
    "market_value_fc" DOUBLE PRECISION NOT NULL,
    "market_value_usd" DOUBLE PRECISION NOT NULL,
    "profit_usd" DOUBLE PRECISION NOT NULL,
    "profit_percentage" DOUBLE PRECISION NOT NULL,
    "issuer" TEXT,
    "sector" TEXT,
    "country" TEXT,
    "cost_price" DOUBLE PRECISION NOT NULL,
    "current_stock_price" DOUBLE PRECISION NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "is_future_dated" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "groupId" UUID NOT NULL,

    CONSTRAINT "AssetMetal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetLoan" (
    "id" UUID NOT NULL,
    "clientId" UUID NOT NULL,
    "portfolio_id" UUID NOT NULL,
    "entity_id" UUID NOT NULL,
    "bank_id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "asset_name" TEXT NOT NULL,
    "currency" "CurrencyDataList" NOT NULL,
    "currency_value" DOUBLE PRECISION NOT NULL,
    "usd_value" DOUBLE PRECISION NOT NULL,
    "market_value_usd" DOUBLE PRECISION NOT NULL,
    "name" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "maturity_date" TIMESTAMP(3) NOT NULL,
    "interest" DOUBLE PRECISION NOT NULL,
    "today_interest" DOUBLE PRECISION NOT NULL,
    "maturity_interest" DOUBLE PRECISION NOT NULL,
    "comment" TEXT,
    "rate" DOUBLE PRECISION NOT NULL,
    "is_future_dated" BOOLEAN NOT NULL DEFAULT false,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transactionId" INTEGER,

    CONSTRAINT "AssetLoan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetOption" (
    "id" UUID NOT NULL,
    "clientId" UUID NOT NULL,
    "portfolio_id" UUID NOT NULL,
    "entity_id" UUID NOT NULL,
    "bank_id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "asset_name" TEXT NOT NULL,
    "currency" "CurrencyDataList" NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "maturity_date" TIMESTAMP(3) NOT NULL,
    "pair_asset_currency" TEXT NOT NULL,
    "principal_value" DOUBLE PRECISION NOT NULL,
    "market_value_usd" DOUBLE PRECISION NOT NULL,
    "strike" DOUBLE PRECISION NOT NULL,
    "premium" DOUBLE PRECISION NOT NULL,
    "contracts" DOUBLE PRECISION NOT NULL,
    "market_open_value" DOUBLE PRECISION NOT NULL,
    "current_market_value" DOUBLE PRECISION NOT NULL,
    "comment" TEXT,
    "rate" DOUBLE PRECISION NOT NULL,
    "is_future_dated" BOOLEAN NOT NULL DEFAULT false,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transactionId" INTEGER,

    CONSTRAINT "AssetOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetRealEstate" (
    "id" UUID NOT NULL,
    "clientId" UUID NOT NULL,
    "portfolio_id" UUID NOT NULL,
    "entity_id" UUID NOT NULL,
    "bank_id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "asset_name" TEXT NOT NULL,
    "currency" "CurrencyDataList" NOT NULL,
    "currency_value" DOUBLE PRECISION NOT NULL,
    "investment_date" TIMESTAMP(3) NOT NULL,
    "usd_value" DOUBLE PRECISION NOT NULL,
    "market_value_fc" DOUBLE PRECISION NOT NULL,
    "market_value_usd" DOUBLE PRECISION NOT NULL,
    "profit_usd" DOUBLE PRECISION NOT NULL,
    "profit_percentage" DOUBLE PRECISION NOT NULL,
    "project_transaction" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "comment" TEXT,
    "operation" TEXT,
    "rate" DOUBLE PRECISION NOT NULL,
    "is_future_dated" BOOLEAN NOT NULL DEFAULT false,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transactionId" INTEGER,

    CONSTRAINT "AssetRealEstate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetOtherInvestment" (
    "id" UUID NOT NULL,
    "clientId" UUID NOT NULL,
    "portfolio_id" UUID NOT NULL,
    "entity_id" UUID NOT NULL,
    "bank_id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "asset_name" TEXT NOT NULL,
    "currency" "CurrencyDataList" NOT NULL,
    "currency_value" DOUBLE PRECISION NOT NULL,
    "usd_value" DOUBLE PRECISION NOT NULL,
    "market_value_usd" DOUBLE PRECISION NOT NULL,
    "cost_value_usd" DOUBLE PRECISION NOT NULL,
    "profit_usd" DOUBLE PRECISION NOT NULL,
    "profit_percentage" DOUBLE PRECISION NOT NULL,
    "investment_asset_name" TEXT NOT NULL,
    "investment_date" TIMESTAMP(3) NOT NULL,
    "service_provider" TEXT NOT NULL,
    "comment" TEXT,
    "custom_fields" JSONB,
    "rate" DOUBLE PRECISION NOT NULL,
    "is_future_dated" BOOLEAN NOT NULL DEFAULT false,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transactionId" INTEGER,

    CONSTRAINT "AssetOtherInvestment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetPrivateEquity" (
    "id" UUID NOT NULL,
    "clientId" UUID NOT NULL,
    "portfolio_id" UUID NOT NULL,
    "entity_id" UUID NOT NULL,
    "bank_id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "asset_name" TEXT NOT NULL,
    "currency" "CurrencyDataList" NOT NULL,
    "currency_value" DOUBLE PRECISION NOT NULL,
    "market_value_usd" DOUBLE PRECISION NOT NULL,
    "pl" DOUBLE PRECISION NOT NULL,
    "fund_type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "entry_date" TIMESTAMP(3) NOT NULL,
    "fund_term_date" TIMESTAMP(3) NOT NULL,
    "last_valuation_date" TIMESTAMP(3) NOT NULL,
    "service_provider" TEXT NOT NULL,
    "geography" TEXT,
    "fund_name" TEXT NOT NULL,
    "fund_id" TEXT NOT NULL,
    "fund_size" TEXT,
    "about_fund" TEXT NOT NULL,
    "investment_period" DOUBLE PRECISION,
    "capital_called" DOUBLE PRECISION NOT NULL,
    "moic" DOUBLE PRECISION NOT NULL,
    "irr" DOUBLE PRECISION,
    "liquidity" DOUBLE PRECISION,
    "total_commitment" DOUBLE PRECISION NOT NULL,
    "tvpi" DOUBLE PRECISION NOT NULL,
    "management_expenses" DOUBLE PRECISION,
    "other_expenses" DOUBLE PRECISION,
    "carried_interest" DOUBLE PRECISION,
    "distributions" DOUBLE PRECISION,
    "holding_entity" TEXT,
    "comment" TEXT,
    "rate" DOUBLE PRECISION NOT NULL,
    "is_future_dated" BOOLEAN NOT NULL DEFAULT false,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transactionId" INTEGER,

    CONSTRAINT "AssetPrivateEquity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetCash" (
    "id" UUID NOT NULL,
    "clientId" UUID NOT NULL,
    "portfolio_id" UUID NOT NULL,
    "entity_id" UUID NOT NULL,
    "bank_id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "asset_name" TEXT NOT NULL,
    "currency" "CurrencyDataList" NOT NULL,
    "comment" TEXT,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transactionId" INTEGER,

    CONSTRAINT "AssetCash_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeletionLog" (
    "id" SERIAL NOT NULL,
    "client_id" TEXT,
    "portfolio_id" TEXT,
    "entity_id" TEXT,
    "bank_id" TEXT,
    "account_id" TEXT,
    "instance_type" "DeleteInstance" NOT NULL,
    "user_email" TEXT,
    "reason" TEXT NOT NULL,
    "user_name" TEXT NOT NULL,
    "deleted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "meta" JSONB NOT NULL,

    CONSTRAINT "DeletionLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AssetEquityGroup_portfolioId_idx" ON "AssetEquityGroup"("portfolioId");

-- CreateIndex
CREATE INDEX "AssetEquityGroup_entityId_idx" ON "AssetEquityGroup"("entityId");

-- CreateIndex
CREATE INDEX "AssetEquityGroup_bankId_idx" ON "AssetEquityGroup"("bankId");

-- CreateIndex
CREATE INDEX "AssetEquityGroup_accountId_idx" ON "AssetEquityGroup"("accountId");

-- CreateIndex
CREATE INDEX "AssetEquityGroup_clientId_idx" ON "AssetEquityGroup"("clientId");

-- CreateIndex
CREATE INDEX "AssetEquityGroup_asset_name_idx" ON "AssetEquityGroup"("asset_name");

-- CreateIndex
CREATE INDEX "AssetEquityGroup_is_archived_idx" ON "AssetEquityGroup"("is_archived");

-- CreateIndex
CREATE UNIQUE INDEX "AssetEquityGroup_accountId_currency_isin_key" ON "AssetEquityGroup"("accountId", "currency", "isin");

-- CreateIndex
CREATE UNIQUE INDEX "AssetEquity_id_key" ON "AssetEquity"("id");

-- CreateIndex
CREATE INDEX "AssetEquity_portfolio_id_idx" ON "AssetEquity"("portfolio_id");

-- CreateIndex
CREATE INDEX "AssetEquity_entity_id_idx" ON "AssetEquity"("entity_id");

-- CreateIndex
CREATE INDEX "AssetEquity_bank_id_idx" ON "AssetEquity"("bank_id");

-- CreateIndex
CREATE INDEX "AssetEquity_account_id_idx" ON "AssetEquity"("account_id");

-- CreateIndex
CREATE INDEX "AssetEquity_client_id_idx" ON "AssetEquity"("client_id");

-- CreateIndex
CREATE INDEX "AssetEquity_asset_name_idx" ON "AssetEquity"("asset_name");

-- CreateIndex
CREATE INDEX "AssetEquity_is_future_dated_idx" ON "AssetEquity"("is_future_dated");

-- CreateIndex
CREATE INDEX "AssetCryptoGroup_portfolioId_idx" ON "AssetCryptoGroup"("portfolioId");

-- CreateIndex
CREATE INDEX "AssetCryptoGroup_entityId_idx" ON "AssetCryptoGroup"("entityId");

-- CreateIndex
CREATE INDEX "AssetCryptoGroup_bankId_idx" ON "AssetCryptoGroup"("bankId");

-- CreateIndex
CREATE INDEX "AssetCryptoGroup_accountId_idx" ON "AssetCryptoGroup"("accountId");

-- CreateIndex
CREATE INDEX "AssetCryptoGroup_clientId_idx" ON "AssetCryptoGroup"("clientId");

-- CreateIndex
CREATE INDEX "AssetCryptoGroup_asset_name_idx" ON "AssetCryptoGroup"("asset_name");

-- CreateIndex
CREATE INDEX "AssetCryptoGroup_is_archived_idx" ON "AssetCryptoGroup"("is_archived");

-- CreateIndex
CREATE INDEX "AssetCryptoGroup_product_type_idx" ON "AssetCryptoGroup"("product_type");

-- CreateIndex
CREATE INDEX "AssetCryptoGroup_crypto_currency_type_idx" ON "AssetCryptoGroup"("crypto_currency_type");

-- CreateIndex
CREATE UNIQUE INDEX "AssetCryptoGroup_accountId_currency_isin_key" ON "AssetCryptoGroup"("accountId", "currency", "isin");

-- CreateIndex
CREATE UNIQUE INDEX "AssetCrypto_id_key" ON "AssetCrypto"("id");

-- CreateIndex
CREATE INDEX "AssetCrypto_portfolio_id_idx" ON "AssetCrypto"("portfolio_id");

-- CreateIndex
CREATE INDEX "AssetCrypto_entity_id_idx" ON "AssetCrypto"("entity_id");

-- CreateIndex
CREATE INDEX "AssetCrypto_bank_id_idx" ON "AssetCrypto"("bank_id");

-- CreateIndex
CREATE INDEX "AssetCrypto_account_id_idx" ON "AssetCrypto"("account_id");

-- CreateIndex
CREATE INDEX "AssetCrypto_client_id_idx" ON "AssetCrypto"("client_id");

-- CreateIndex
CREATE INDEX "AssetCrypto_asset_name_idx" ON "AssetCrypto"("asset_name");

-- CreateIndex
CREATE INDEX "AssetCrypto_is_future_dated_idx" ON "AssetCrypto"("is_future_dated");

-- CreateIndex
CREATE INDEX "AssetMetalGroup_portfolioId_idx" ON "AssetMetalGroup"("portfolioId");

-- CreateIndex
CREATE INDEX "AssetMetalGroup_entityId_idx" ON "AssetMetalGroup"("entityId");

-- CreateIndex
CREATE INDEX "AssetMetalGroup_bankId_idx" ON "AssetMetalGroup"("bankId");

-- CreateIndex
CREATE INDEX "AssetMetalGroup_accountId_idx" ON "AssetMetalGroup"("accountId");

-- CreateIndex
CREATE INDEX "AssetMetalGroup_clientId_idx" ON "AssetMetalGroup"("clientId");

-- CreateIndex
CREATE INDEX "AssetMetalGroup_asset_name_idx" ON "AssetMetalGroup"("asset_name");

-- CreateIndex
CREATE INDEX "AssetMetalGroup_is_archived_idx" ON "AssetMetalGroup"("is_archived");

-- CreateIndex
CREATE INDEX "AssetMetalGroup_product_type_idx" ON "AssetMetalGroup"("product_type");

-- CreateIndex
CREATE INDEX "AssetMetalGroup_metal_type_idx" ON "AssetMetalGroup"("metal_type");

-- CreateIndex
CREATE UNIQUE INDEX "AssetMetalGroup_accountId_currency_isin_key" ON "AssetMetalGroup"("accountId", "currency", "isin");

-- CreateIndex
CREATE UNIQUE INDEX "AssetMetalGroup_accountId_currency_metal_type_key" ON "AssetMetalGroup"("accountId", "currency", "metal_type");

-- CreateIndex
CREATE UNIQUE INDEX "AssetMetal_id_key" ON "AssetMetal"("id");

-- CreateIndex
CREATE INDEX "AssetMetal_portfolio_id_idx" ON "AssetMetal"("portfolio_id");

-- CreateIndex
CREATE INDEX "AssetMetal_entity_id_idx" ON "AssetMetal"("entity_id");

-- CreateIndex
CREATE INDEX "AssetMetal_bank_id_idx" ON "AssetMetal"("bank_id");

-- CreateIndex
CREATE INDEX "AssetMetal_account_id_idx" ON "AssetMetal"("account_id");

-- CreateIndex
CREATE INDEX "AssetMetal_client_id_idx" ON "AssetMetal"("client_id");

-- CreateIndex
CREATE INDEX "AssetMetal_asset_name_idx" ON "AssetMetal"("asset_name");

-- CreateIndex
CREATE INDEX "AssetMetal_is_future_dated_idx" ON "AssetMetal"("is_future_dated");

-- CreateIndex
CREATE UNIQUE INDEX "AssetLoan_id_key" ON "AssetLoan"("id");

-- CreateIndex
CREATE INDEX "AssetLoan_portfolio_id_idx" ON "AssetLoan"("portfolio_id");

-- CreateIndex
CREATE INDEX "AssetLoan_entity_id_idx" ON "AssetLoan"("entity_id");

-- CreateIndex
CREATE INDEX "AssetLoan_bank_id_idx" ON "AssetLoan"("bank_id");

-- CreateIndex
CREATE INDEX "AssetLoan_account_id_idx" ON "AssetLoan"("account_id");

-- CreateIndex
CREATE INDEX "AssetLoan_clientId_idx" ON "AssetLoan"("clientId");

-- CreateIndex
CREATE INDEX "AssetLoan_asset_name_idx" ON "AssetLoan"("asset_name");

-- CreateIndex
CREATE INDEX "AssetLoan_is_future_dated_idx" ON "AssetLoan"("is_future_dated");

-- CreateIndex
CREATE UNIQUE INDEX "AssetOption_id_key" ON "AssetOption"("id");

-- CreateIndex
CREATE INDEX "AssetOption_portfolio_id_idx" ON "AssetOption"("portfolio_id");

-- CreateIndex
CREATE INDEX "AssetOption_entity_id_idx" ON "AssetOption"("entity_id");

-- CreateIndex
CREATE INDEX "AssetOption_bank_id_idx" ON "AssetOption"("bank_id");

-- CreateIndex
CREATE INDEX "AssetOption_account_id_idx" ON "AssetOption"("account_id");

-- CreateIndex
CREATE INDEX "AssetOption_clientId_idx" ON "AssetOption"("clientId");

-- CreateIndex
CREATE INDEX "AssetOption_asset_name_idx" ON "AssetOption"("asset_name");

-- CreateIndex
CREATE INDEX "AssetOption_is_future_dated_idx" ON "AssetOption"("is_future_dated");

-- CreateIndex
CREATE UNIQUE INDEX "AssetRealEstate_id_key" ON "AssetRealEstate"("id");

-- CreateIndex
CREATE INDEX "AssetRealEstate_portfolio_id_idx" ON "AssetRealEstate"("portfolio_id");

-- CreateIndex
CREATE INDEX "AssetRealEstate_entity_id_idx" ON "AssetRealEstate"("entity_id");

-- CreateIndex
CREATE INDEX "AssetRealEstate_bank_id_idx" ON "AssetRealEstate"("bank_id");

-- CreateIndex
CREATE INDEX "AssetRealEstate_account_id_idx" ON "AssetRealEstate"("account_id");

-- CreateIndex
CREATE INDEX "AssetRealEstate_clientId_idx" ON "AssetRealEstate"("clientId");

-- CreateIndex
CREATE INDEX "AssetRealEstate_asset_name_idx" ON "AssetRealEstate"("asset_name");

-- CreateIndex
CREATE INDEX "AssetRealEstate_is_future_dated_idx" ON "AssetRealEstate"("is_future_dated");

-- CreateIndex
CREATE UNIQUE INDEX "AssetOtherInvestment_id_key" ON "AssetOtherInvestment"("id");

-- CreateIndex
CREATE INDEX "AssetOtherInvestment_portfolio_id_idx" ON "AssetOtherInvestment"("portfolio_id");

-- CreateIndex
CREATE INDEX "AssetOtherInvestment_entity_id_idx" ON "AssetOtherInvestment"("entity_id");

-- CreateIndex
CREATE INDEX "AssetOtherInvestment_bank_id_idx" ON "AssetOtherInvestment"("bank_id");

-- CreateIndex
CREATE INDEX "AssetOtherInvestment_account_id_idx" ON "AssetOtherInvestment"("account_id");

-- CreateIndex
CREATE INDEX "AssetOtherInvestment_clientId_idx" ON "AssetOtherInvestment"("clientId");

-- CreateIndex
CREATE INDEX "AssetOtherInvestment_asset_name_idx" ON "AssetOtherInvestment"("asset_name");

-- CreateIndex
CREATE INDEX "AssetOtherInvestment_is_future_dated_idx" ON "AssetOtherInvestment"("is_future_dated");

-- CreateIndex
CREATE UNIQUE INDEX "AssetPrivateEquity_id_key" ON "AssetPrivateEquity"("id");

-- CreateIndex
CREATE INDEX "AssetPrivateEquity_portfolio_id_idx" ON "AssetPrivateEquity"("portfolio_id");

-- CreateIndex
CREATE INDEX "AssetPrivateEquity_entity_id_idx" ON "AssetPrivateEquity"("entity_id");

-- CreateIndex
CREATE INDEX "AssetPrivateEquity_bank_id_idx" ON "AssetPrivateEquity"("bank_id");

-- CreateIndex
CREATE INDEX "AssetPrivateEquity_account_id_idx" ON "AssetPrivateEquity"("account_id");

-- CreateIndex
CREATE INDEX "AssetPrivateEquity_clientId_idx" ON "AssetPrivateEquity"("clientId");

-- CreateIndex
CREATE INDEX "AssetPrivateEquity_asset_name_idx" ON "AssetPrivateEquity"("asset_name");

-- CreateIndex
CREATE INDEX "AssetPrivateEquity_is_future_dated_idx" ON "AssetPrivateEquity"("is_future_dated");

-- CreateIndex
CREATE UNIQUE INDEX "AssetCash_id_key" ON "AssetCash"("id");

-- CreateIndex
CREATE INDEX "AssetCash_portfolio_id_idx" ON "AssetCash"("portfolio_id");

-- CreateIndex
CREATE INDEX "AssetCash_entity_id_idx" ON "AssetCash"("entity_id");

-- CreateIndex
CREATE INDEX "AssetCash_bank_id_idx" ON "AssetCash"("bank_id");

-- CreateIndex
CREATE INDEX "AssetCash_account_id_idx" ON "AssetCash"("account_id");

-- CreateIndex
CREATE INDEX "AssetCash_clientId_idx" ON "AssetCash"("clientId");

-- CreateIndex
CREATE INDEX "AssetCash_asset_name_idx" ON "AssetCash"("asset_name");

-- CreateIndex
CREATE INDEX "DeletionLog_instance_type_idx" ON "DeletionLog"("instance_type");

-- CreateIndex
CREATE INDEX "DeletionLog_user_name_idx" ON "DeletionLog"("user_name");

-- CreateIndex
CREATE INDEX "DeletionLog_deleted_at_idx" ON "DeletionLog"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "AssetBondGroup_accountId_currency_isin_key" ON "AssetBondGroup"("accountId", "currency", "isin");

-- CreateIndex
CREATE INDEX "AssetDeposit_clientId_idx" ON "AssetDeposit"("clientId");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_assetBondId_fkey" FOREIGN KEY ("assetBondId") REFERENCES "AssetBond"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_assetEquityId_fkey" FOREIGN KEY ("assetEquityId") REFERENCES "AssetEquity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_assetDepositId_fkey" FOREIGN KEY ("assetDepositId") REFERENCES "AssetDeposit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_assetCryptoId_fkey" FOREIGN KEY ("assetCryptoId") REFERENCES "AssetCrypto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_assetMetalId_fkey" FOREIGN KEY ("assetMetalId") REFERENCES "AssetMetal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_assetLoanId_fkey" FOREIGN KEY ("assetLoanId") REFERENCES "AssetLoan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_assetOptionId_fkey" FOREIGN KEY ("assetOptionId") REFERENCES "AssetOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_assetRealEstateId_fkey" FOREIGN KEY ("assetRealEstateId") REFERENCES "AssetRealEstate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_assetOtherInvestmentId_fkey" FOREIGN KEY ("assetOtherInvestmentId") REFERENCES "AssetOtherInvestment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_assetPrivateEquityId_fkey" FOREIGN KEY ("assetPrivateEquityId") REFERENCES "AssetPrivateEquity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_assetCashId_fkey" FOREIGN KEY ("assetCashId") REFERENCES "AssetCash"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_assetBondId_fkey" FOREIGN KEY ("assetBondId") REFERENCES "AssetBond"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_assetEquityId_fkey" FOREIGN KEY ("assetEquityId") REFERENCES "AssetEquity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestDraft" ADD CONSTRAINT "RequestDraft_assetBondId_fkey" FOREIGN KEY ("assetBondId") REFERENCES "AssetBond"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestDraft" ADD CONSTRAINT "RequestDraft_assetEquityId_fkey" FOREIGN KEY ("assetEquityId") REFERENCES "AssetEquity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_equityId_fkey" FOREIGN KEY ("equityId") REFERENCES "Equity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_assetMetalGroupId_fkey" FOREIGN KEY ("assetMetalGroupId") REFERENCES "AssetMetalGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_assetBondId_fkey" FOREIGN KEY ("assetBondId") REFERENCES "AssetBond"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_assetEquityId_fkey" FOREIGN KEY ("assetEquityId") REFERENCES "AssetEquity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_assetDepositId_fkey" FOREIGN KEY ("assetDepositId") REFERENCES "AssetDeposit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_assetCryptoId_fkey" FOREIGN KEY ("assetCryptoId") REFERENCES "AssetCrypto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_assetMetalId_fkey" FOREIGN KEY ("assetMetalId") REFERENCES "AssetMetal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_assetLoanId_fkey" FOREIGN KEY ("assetLoanId") REFERENCES "AssetLoan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_assetOptionId_fkey" FOREIGN KEY ("assetOptionId") REFERENCES "AssetOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_assetRealEstateId_fkey" FOREIGN KEY ("assetRealEstateId") REFERENCES "AssetRealEstate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_assetOtherInvestmentId_fkey" FOREIGN KEY ("assetOtherInvestmentId") REFERENCES "AssetOtherInvestment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_assetPrivateEquityId_fkey" FOREIGN KEY ("assetPrivateEquityId") REFERENCES "AssetPrivateEquity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetBondGroup" ADD CONSTRAINT "AssetBondGroup_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetEquityGroup" ADD CONSTRAINT "AssetEquityGroup_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetEquityGroup" ADD CONSTRAINT "AssetEquityGroup_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetEquityGroup" ADD CONSTRAINT "AssetEquityGroup_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "Bank"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetEquityGroup" ADD CONSTRAINT "AssetEquityGroup_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetEquityGroup" ADD CONSTRAINT "AssetEquityGroup_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetEquityGroup" ADD CONSTRAINT "AssetEquityGroup_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetEquity" ADD CONSTRAINT "AssetEquity_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "AssetEquityGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetDeposit" ADD CONSTRAINT "AssetDeposit_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetCryptoGroup" ADD CONSTRAINT "AssetCryptoGroup_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetCryptoGroup" ADD CONSTRAINT "AssetCryptoGroup_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetCryptoGroup" ADD CONSTRAINT "AssetCryptoGroup_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "Bank"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetCryptoGroup" ADD CONSTRAINT "AssetCryptoGroup_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetCryptoGroup" ADD CONSTRAINT "AssetCryptoGroup_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetCryptoGroup" ADD CONSTRAINT "AssetCryptoGroup_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetCrypto" ADD CONSTRAINT "AssetCrypto_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "AssetCryptoGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetMetalGroup" ADD CONSTRAINT "AssetMetalGroup_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetMetalGroup" ADD CONSTRAINT "AssetMetalGroup_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetMetalGroup" ADD CONSTRAINT "AssetMetalGroup_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "Bank"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetMetalGroup" ADD CONSTRAINT "AssetMetalGroup_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetMetalGroup" ADD CONSTRAINT "AssetMetalGroup_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetMetal" ADD CONSTRAINT "AssetMetal_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "AssetMetalGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetLoan" ADD CONSTRAINT "AssetLoan_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetLoan" ADD CONSTRAINT "AssetLoan_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetLoan" ADD CONSTRAINT "AssetLoan_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetLoan" ADD CONSTRAINT "AssetLoan_bank_id_fkey" FOREIGN KEY ("bank_id") REFERENCES "Bank"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetLoan" ADD CONSTRAINT "AssetLoan_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetOption" ADD CONSTRAINT "AssetOption_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetOption" ADD CONSTRAINT "AssetOption_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetOption" ADD CONSTRAINT "AssetOption_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetOption" ADD CONSTRAINT "AssetOption_bank_id_fkey" FOREIGN KEY ("bank_id") REFERENCES "Bank"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetOption" ADD CONSTRAINT "AssetOption_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetRealEstate" ADD CONSTRAINT "AssetRealEstate_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetRealEstate" ADD CONSTRAINT "AssetRealEstate_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetRealEstate" ADD CONSTRAINT "AssetRealEstate_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetRealEstate" ADD CONSTRAINT "AssetRealEstate_bank_id_fkey" FOREIGN KEY ("bank_id") REFERENCES "Bank"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetRealEstate" ADD CONSTRAINT "AssetRealEstate_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetOtherInvestment" ADD CONSTRAINT "AssetOtherInvestment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetOtherInvestment" ADD CONSTRAINT "AssetOtherInvestment_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetOtherInvestment" ADD CONSTRAINT "AssetOtherInvestment_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetOtherInvestment" ADD CONSTRAINT "AssetOtherInvestment_bank_id_fkey" FOREIGN KEY ("bank_id") REFERENCES "Bank"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetOtherInvestment" ADD CONSTRAINT "AssetOtherInvestment_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetPrivateEquity" ADD CONSTRAINT "AssetPrivateEquity_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetPrivateEquity" ADD CONSTRAINT "AssetPrivateEquity_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetPrivateEquity" ADD CONSTRAINT "AssetPrivateEquity_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetPrivateEquity" ADD CONSTRAINT "AssetPrivateEquity_bank_id_fkey" FOREIGN KEY ("bank_id") REFERENCES "Bank"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetPrivateEquity" ADD CONSTRAINT "AssetPrivateEquity_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetCash" ADD CONSTRAINT "AssetCash_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetCash" ADD CONSTRAINT "AssetCash_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetCash" ADD CONSTRAINT "AssetCash_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetCash" ADD CONSTRAINT "AssetCash_bank_id_fkey" FOREIGN KEY ("bank_id") REFERENCES "Bank"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetCash" ADD CONSTRAINT "AssetCash_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetCash" ADD CONSTRAINT "AssetCash_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
