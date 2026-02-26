/*
  Warnings:

  - You are about to drop the column `emission_default` on the `CBonds` table. All the data in the column will be lost.
  - You are about to drop the column `emission_guarantors` on the `CBonds` table. All the data in the column will be lost.
  - You are about to drop the column `flow_new` on the `CBonds` table. All the data in the column will be lost.
  - You are about to drop the column `index_value_new` on the `CBonds` table. All the data in the column will be lost.
  - You are about to drop the column `offert` on the `CBonds` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CBonds" DROP COLUMN "emission_default",
DROP COLUMN "emission_guarantors",
DROP COLUMN "flow_new",
DROP COLUMN "index_value_new",
DROP COLUMN "offert";
