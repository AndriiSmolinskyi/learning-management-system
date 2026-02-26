/*
  Warnings:

  - A unique constraint covering the columns `[currency_id]` on the table `CurrencyData` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `currency_id` to the `CurrencyData` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CurrencyData" ADD COLUMN     "currency_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CurrencyData_currency_id_key" ON "CurrencyData"("currency_id");
