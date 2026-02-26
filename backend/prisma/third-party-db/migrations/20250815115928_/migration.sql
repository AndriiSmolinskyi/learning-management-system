-- CreateTable
CREATE TABLE "Bond" (
    "id" SERIAL NOT NULL,
    "isin" TEXT NOT NULL,
    "security" TEXT NOT NULL,
    "market_price" DECIMAL(30,18) NOT NULL,
    "dirty_price_currency" DECIMAL(30,18),
    "yield" DECIMAL(30,18),
    "selling_quote" DECIMAL(30,18) NOT NULL,
    "ytc_offer" DECIMAL(30,18),
    "g_spread" DECIMAL(30,18),
    "accrued" DECIMAL(30,18),
    "trade_date" TIMESTAMP(3) NOT NULL,
    "issuer" TEXT,
    "nominal_price" TEXT NOT NULL,
    "maturity_date" TIMESTAMP(3),
    "country" TEXT NOT NULL,
    "sector" TEXT,
    "coupon" TEXT,
    "next_coupon_date" TIMESTAMP(3),
    "offert_date_call" TIMESTAMP(3),
    "isinId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bond_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BondHistory" (
    "id" SERIAL NOT NULL,
    "bondId" INTEGER NOT NULL,
    "isin" TEXT NOT NULL,
    "security" TEXT NOT NULL,
    "market_price" DECIMAL(30,18) NOT NULL,
    "dirty_price_currency" DECIMAL(30,18),
    "yield" DECIMAL(30,18),
    "selling_quote" DECIMAL(30,18) NOT NULL,
    "ytc_offer" DECIMAL(30,18),
    "g_spread" DECIMAL(30,18),
    "accrued" DECIMAL(30,18),
    "trade_date" TIMESTAMP(3) NOT NULL,
    "issuer" TEXT,
    "nominal_price" TEXT NOT NULL,
    "maturity_date" TIMESTAMP(3),
    "country" TEXT NOT NULL,
    "sector" TEXT,
    "coupon" TEXT,
    "next_coupon_date" TIMESTAMP(3),
    "offert_date_call" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BondHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equity" (
    "id" SERIAL NOT NULL,
    "isin" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "trading_ground_id" INTEGER NOT NULL,
    "last_price" DECIMAL(30,18) NOT NULL,
    "emitent_name" TEXT NOT NULL,
    "emitent_branch_id" TEXT NOT NULL,
    "trading_ground_name" TEXT NOT NULL,
    "equity_currency_id" TEXT NOT NULL,
    "currency_name" TEXT NOT NULL,
    "stock_emitent_id" TEXT NOT NULL,
    "stock_emitent_name" TEXT NOT NULL,
    "stock_country_name" TEXT NOT NULL,
    "branch_name" TEXT,
    "isinId" INTEGER NOT NULL,
    "currency_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Equity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquityHistory" (
    "id" SERIAL NOT NULL,
    "equityId" INTEGER NOT NULL,
    "isin" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "trading_ground_id" INTEGER NOT NULL,
    "last_price" DECIMAL(30,18) NOT NULL,
    "emitent_name" TEXT NOT NULL,
    "emitent_branch_id" TEXT NOT NULL,
    "trading_ground_name" TEXT NOT NULL,
    "equity_currency_id" TEXT NOT NULL,
    "currency_name" TEXT NOT NULL,
    "stock_emitent_id" TEXT NOT NULL,
    "stock_emitent_name" TEXT NOT NULL,
    "stock_country_name" TEXT NOT NULL,
    "branch_name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EquityHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Etf" (
    "id" SERIAL NOT NULL,
    "isin" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "close" DECIMAL(30,18) NOT NULL,
    "distribution_amount" DECIMAL(30,18) NOT NULL,
    "currency_name" TEXT NOT NULL,
    "funds_name" TEXT NOT NULL,
    "trading_ground_name" TEXT NOT NULL,
    "geography_investment_name" TEXT NOT NULL,
    "sector_name" TEXT NOT NULL,
    "trading_ground_id" INTEGER NOT NULL,
    "equity_currency_id" TEXT NOT NULL,
    "isinId" INTEGER NOT NULL,
    "currency_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Etf_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EtfHistory" (
    "id" SERIAL NOT NULL,
    "etfId" INTEGER NOT NULL,
    "isin" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "close" DECIMAL(30,18) NOT NULL,
    "distribution_amount" DECIMAL(30,18) NOT NULL,
    "currency_name" TEXT NOT NULL,
    "funds_name" TEXT NOT NULL,
    "trading_ground_name" TEXT NOT NULL,
    "geography_investment_name" TEXT NOT NULL,
    "sector_name" TEXT NOT NULL,
    "trading_ground_id" INTEGER NOT NULL,
    "equity_currency_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EtfHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bond_isin_key" ON "Bond"("isin");

-- CreateIndex
CREATE INDEX "Bond_isin_idx" ON "Bond"("isin");

-- CreateIndex
CREATE INDEX "Equity_isin_idx" ON "Equity"("isin");

-- CreateIndex
CREATE INDEX "Equity_currency_id_idx" ON "Equity"("currency_id");

-- CreateIndex
CREATE UNIQUE INDEX "Equity_isin_currency_id_key" ON "Equity"("isin", "currency_id");

-- CreateIndex
CREATE INDEX "Etf_isin_idx" ON "Etf"("isin");

-- CreateIndex
CREATE INDEX "Etf_currency_id_idx" ON "Etf"("currency_id");

-- CreateIndex
CREATE UNIQUE INDEX "Etf_isin_currency_id_key" ON "Etf"("isin", "currency_id");

-- AddForeignKey
ALTER TABLE "Bond" ADD CONSTRAINT "Bond_isinId_fkey" FOREIGN KEY ("isinId") REFERENCES "Isins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BondHistory" ADD CONSTRAINT "BondHistory_bondId_fkey" FOREIGN KEY ("bondId") REFERENCES "Bond"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equity" ADD CONSTRAINT "Equity_isinId_fkey" FOREIGN KEY ("isinId") REFERENCES "Isins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equity" ADD CONSTRAINT "Equity_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "CurrencyData"("currency_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquityHistory" ADD CONSTRAINT "EquityHistory_equityId_fkey" FOREIGN KEY ("equityId") REFERENCES "Equity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Etf" ADD CONSTRAINT "Etf_isinId_fkey" FOREIGN KEY ("isinId") REFERENCES "Isins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Etf" ADD CONSTRAINT "Etf_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "CurrencyData"("currency_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EtfHistory" ADD CONSTRAINT "EtfHistory_etfId_fkey" FOREIGN KEY ("etfId") REFERENCES "Etf"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
