-- CreateEnum
CREATE TYPE "CurrencyDataList" AS ENUM ('AED', 'AUD', 'BRL', 'CAD', 'CHF', 'EUR', 'GBP', 'HKD', 'ILS', 'JPY', 'MXN', 'NOK', 'RUB', 'TRY', 'USD', 'ZAR', 'DKK', 'SEK', 'KRW', 'CNY', 'KZT');

-- CreateEnum
CREATE TYPE "MetalDataList" AS ENUM ('XAU', 'XAG', 'XPT', 'XPD');

-- CreateEnum
CREATE TYPE "CryptoList" AS ENUM ('BTC', 'ETH');

-- CreateEnum
CREATE TYPE "IsinType" AS ENUM ('Bond', 'Equity', 'ETF');

-- CreateTable
CREATE TABLE "DocumentType" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentType_pkey" PRIMARY KEY ("id")
);

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
    "emission_default" JSONB NOT NULL,
    "emission_guarantors" JSONB NOT NULL,
    "flow_new" JSONB NOT NULL,
    "offert" JSONB NOT NULL,
    "index_value_new" JSONB NOT NULL,
    "tradings_stocks_full_new" JSONB NOT NULL,
    "stocks_trading_grounds" JSONB NOT NULL,
    "stocks_full" JSONB NOT NULL,
    "emitents" JSONB NOT NULL,
    "etf_dividends" JSONB NOT NULL,
    "etf_funds" JSONB NOT NULL,
    "etf_quotes" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CBonds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BondsData" (
    "id" UUID NOT NULL,
    "isin" TEXT NOT NULL,
    "market_price" TEXT,
    "security" TEXT,
    "accrued" TEXT,
    "yield" TEXT,
    "issuer" TEXT,
    "currency" TEXT,
    "maturity_date" TIMESTAMP(3),
    "country" TEXT,
    "sector" TEXT,
    "coupon" TEXT,
    "selling_quote" TEXT,
    "ytc_offer" TEXT,
    "g_spread" TEXT,
    "dirty_price_currency" TEXT,
    "nominal_price" TEXT,
    "offert_date_call" TIMESTAMP(3),
    "next_coupon_date" TIMESTAMP(3),
    "trade_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BondsData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CurrencyData" (
    "id" UUID NOT NULL,
    "currency" "CurrencyDataList" NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CurrencyData_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "ExpenseCategoryList" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExpenseCategoryList_pkey" PRIMARY KEY ("id")
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

    CONSTRAINT "Isins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DocumentType_id_key" ON "DocumentType"("id");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentType_name_key" ON "DocumentType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceProvidersList_id_key" ON "ServiceProvidersList"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceProvidersList_name_key" ON "ServiceProvidersList"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CBonds_id_key" ON "CBonds"("id");

-- CreateIndex
CREATE UNIQUE INDEX "BondsData_isin_key" ON "BondsData"("isin");

-- CreateIndex
CREATE UNIQUE INDEX "CurrencyData_currency_key" ON "CurrencyData"("currency");

-- CreateIndex
CREATE UNIQUE INDEX "CryptoData_name_key" ON "CryptoData"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CryptoData_token_key" ON "CryptoData"("token");

-- CreateIndex
CREATE UNIQUE INDEX "MetalData_currency_key" ON "MetalData"("currency");

-- CreateIndex
CREATE UNIQUE INDEX "ExpenseCategoryList_id_key" ON "ExpenseCategoryList"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ExpenseCategoryList_name_key" ON "ExpenseCategoryList"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Isins_isin_key" ON "Isins"("isin");
