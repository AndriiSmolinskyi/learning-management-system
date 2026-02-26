/*
  Warnings:

  - Added the required column `etf_trading_grounds` to the `CBonds` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CBonds" ADD COLUMN     "etf_trading_grounds" JSONB NOT NULL;
