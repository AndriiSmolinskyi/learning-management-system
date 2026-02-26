/*
  Warnings:

  - Added the required column `currency_id` to the `Isins` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Isins" ADD COLUMN     "currency_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Isins" ADD CONSTRAINT "Isins_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "CurrencyData"("currency_id") ON DELETE RESTRICT ON UPDATE CASCADE;
