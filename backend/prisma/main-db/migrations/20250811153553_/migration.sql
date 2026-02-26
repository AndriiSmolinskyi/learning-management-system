-- CreateEnum
CREATE TYPE "MetalDataList" AS ENUM ('XAU', 'XAG', 'XPT', 'XPD');

-- CreateEnum
CREATE TYPE "CryptoList" AS ENUM ('BTC', 'ETH');

-- CreateEnum
CREATE TYPE "IsinType" AS ENUM ('Bond', 'Equity', 'ETF');

-- AlterTable
ALTER TABLE "ClientDraft" ALTER COLUMN "emails" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "emails" SET DATA TYPE TEXT[],
ALTER COLUMN "contacts" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "contacts" SET DATA TYPE TEXT[];

-- AlterTable
ALTER TABLE "Report" ALTER COLUMN "isins" SET DEFAULT ARRAY[]::VARCHAR(50)[];

-- AlterTable
ALTER TABLE "ReportDraft" ALTER COLUMN "isins" SET DEFAULT ARRAY[]::VARCHAR(50)[];

-- CreateTable
CREATE TABLE "ServiceProvidersList" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceProvidersList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CBonds" (
    "id" UUID NOT NULL,
    "tradings_new" JSONB NOT NULL,
    "emissions" JSONB NOT NULL,
    "tradings_stocks_full_new" JSONB NOT NULL,
    "stocks_trading_grounds" JSONB NOT NULL,
    "stocks_full" JSONB NOT NULL,
    "emitents" JSONB NOT NULL,
    "etf_dividends" JSONB NOT NULL,
    "etf_funds" JSONB NOT NULL,
    "etf_quotes" JSONB NOT NULL,
    "etf_trading_grounds" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CBonds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CurrencyData" (
    "id" UUID NOT NULL,
    "currency" "CurrencyDataList" NOT NULL,
    "currency_id" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "type_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CurrencyData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CurrencyHistoryData" (
    "id" UUID NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "currency_id" UUID NOT NULL,

    CONSTRAINT "CurrencyHistoryData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CryptoData" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "token" "CryptoList" NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CryptoData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetalData" (
    "id" UUID NOT NULL,
    "currency" "MetalDataList" NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MetalData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetalHistoryData" (
    "id" UUID NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "currency_id" UUID NOT NULL,

    CONSTRAINT "MetalHistoryData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Isins" (
    "id" SERIAL NOT NULL,
    "isin" TEXT NOT NULL,
    "is_activated" BOOLEAN NOT NULL DEFAULT false,
    "type_id" TEXT NOT NULL,
    "type" "IsinType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currency_id" TEXT NOT NULL,

    CONSTRAINT "Isins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentType" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ServiceProvidersList_id_key" ON "ServiceProvidersList"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceProvidersList_name_key" ON "ServiceProvidersList"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CBonds_id_key" ON "CBonds"("id");

-- CreateIndex
CREATE INDEX "CBonds_created_at_idx" ON "CBonds"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "CurrencyData_currency_key" ON "CurrencyData"("currency");

-- CreateIndex
CREATE UNIQUE INDEX "CurrencyData_currency_id_key" ON "CurrencyData"("currency_id");

-- CreateIndex
CREATE UNIQUE INDEX "CurrencyData_type_id_key" ON "CurrencyData"("type_id");

-- CreateIndex
CREATE UNIQUE INDEX "CryptoData_name_key" ON "CryptoData"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CryptoData_token_key" ON "CryptoData"("token");

-- CreateIndex
CREATE UNIQUE INDEX "MetalData_currency_key" ON "MetalData"("currency");

-- CreateIndex
CREATE UNIQUE INDEX "Isins_isin_key" ON "Isins"("isin");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentType_id_key" ON "DocumentType"("id");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentType_name_key" ON "DocumentType"("name");

-- AddForeignKey
ALTER TABLE "CurrencyHistoryData" ADD CONSTRAINT "CurrencyHistoryData_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "CurrencyData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetalHistoryData" ADD CONSTRAINT "MetalHistoryData_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "MetalData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Isins" ADD CONSTRAINT "Isins_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "CurrencyData"("currency_id") ON DELETE RESTRICT ON UPDATE CASCADE;
