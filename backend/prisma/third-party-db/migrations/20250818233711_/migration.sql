/*
  Warnings:

  - You are about to alter the column `market_price` on the `Bond` table. The data in that column could be lost. The data in that column will be cast from `Decimal(30,18)` to `DoublePrecision`.
  - You are about to alter the column `dirty_price_currency` on the `Bond` table. The data in that column could be lost. The data in that column will be cast from `Decimal(30,18)` to `DoublePrecision`.
  - You are about to alter the column `yield` on the `Bond` table. The data in that column could be lost. The data in that column will be cast from `Decimal(30,18)` to `DoublePrecision`.
  - You are about to alter the column `selling_quote` on the `Bond` table. The data in that column could be lost. The data in that column will be cast from `Decimal(30,18)` to `DoublePrecision`.
  - You are about to alter the column `ytc_offer` on the `Bond` table. The data in that column could be lost. The data in that column will be cast from `Decimal(30,18)` to `DoublePrecision`.
  - You are about to alter the column `g_spread` on the `Bond` table. The data in that column could be lost. The data in that column will be cast from `Decimal(30,18)` to `DoublePrecision`.
  - You are about to alter the column `accrued` on the `Bond` table. The data in that column could be lost. The data in that column will be cast from `Decimal(30,18)` to `DoublePrecision`.
  - You are about to alter the column `market_price` on the `BondHistory` table. The data in that column could be lost. The data in that column will be cast from `Decimal(30,18)` to `DoublePrecision`.
  - You are about to alter the column `dirty_price_currency` on the `BondHistory` table. The data in that column could be lost. The data in that column will be cast from `Decimal(30,18)` to `DoublePrecision`.
  - You are about to alter the column `yield` on the `BondHistory` table. The data in that column could be lost. The data in that column will be cast from `Decimal(30,18)` to `DoublePrecision`.
  - You are about to alter the column `selling_quote` on the `BondHistory` table. The data in that column could be lost. The data in that column will be cast from `Decimal(30,18)` to `DoublePrecision`.
  - You are about to alter the column `ytc_offer` on the `BondHistory` table. The data in that column could be lost. The data in that column will be cast from `Decimal(30,18)` to `DoublePrecision`.
  - You are about to alter the column `g_spread` on the `BondHistory` table. The data in that column could be lost. The data in that column will be cast from `Decimal(30,18)` to `DoublePrecision`.
  - You are about to alter the column `accrued` on the `BondHistory` table. The data in that column could be lost. The data in that column will be cast from `Decimal(30,18)` to `DoublePrecision`.
  - You are about to alter the column `last_price` on the `Equity` table. The data in that column could be lost. The data in that column will be cast from `Decimal(30,18)` to `DoublePrecision`.
  - You are about to alter the column `last_price` on the `EquityHistory` table. The data in that column could be lost. The data in that column will be cast from `Decimal(30,18)` to `DoublePrecision`.
  - You are about to alter the column `close` on the `Etf` table. The data in that column could be lost. The data in that column will be cast from `Decimal(30,18)` to `DoublePrecision`.
  - You are about to alter the column `distribution_amount` on the `Etf` table. The data in that column could be lost. The data in that column will be cast from `Decimal(30,18)` to `DoublePrecision`.
  - You are about to alter the column `close` on the `EtfHistory` table. The data in that column could be lost. The data in that column will be cast from `Decimal(30,18)` to `DoublePrecision`.
  - You are about to alter the column `distribution_amount` on the `EtfHistory` table. The data in that column could be lost. The data in that column will be cast from `Decimal(30,18)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "Bond" ALTER COLUMN "market_price" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "dirty_price_currency" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "yield" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "selling_quote" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "ytc_offer" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "g_spread" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "accrued" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "nominal_price" DROP NOT NULL;

-- AlterTable
ALTER TABLE "BondHistory" ALTER COLUMN "market_price" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "dirty_price_currency" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "yield" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "selling_quote" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "ytc_offer" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "g_spread" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "accrued" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "nominal_price" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Equity" ALTER COLUMN "last_price" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "EquityHistory" ALTER COLUMN "last_price" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Etf" ALTER COLUMN "close" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "distribution_amount" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "EtfHistory" ALTER COLUMN "close" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "distribution_amount" SET DATA TYPE DOUBLE PRECISION;
