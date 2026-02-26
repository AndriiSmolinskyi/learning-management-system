/*
  Warnings:

  - A unique constraint covering the columns `[type_id]` on the table `CurrencyData` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `type_id` to the `CurrencyData` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CurrencyData" ADD COLUMN     "type_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CurrencyData_type_id_key" ON "CurrencyData"("type_id");
