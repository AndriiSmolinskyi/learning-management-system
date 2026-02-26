/*
  Warnings:

  - You are about to drop the column `budget_plan_darft_id` on the `BudgetPlanAllocation` table. All the data in the column will be lost.
  - You are about to drop the column `accountId` on the `BudgetPlanBankAccount` table. All the data in the column will be lost.
  - You are about to drop the column `bankId` on the `BudgetPlanBankAccount` table. All the data in the column will be lost.
  - You are about to drop the column `budgetPlanDraftId` on the `BudgetPlanBankAccount` table. All the data in the column will be lost.
  - You are about to drop the column `budgetPlanId` on the `BudgetPlanBankAccount` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `Report` table. All the data in the column will be lost.
  - Added the required column `account_id` to the `BudgetPlanBankAccount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bank_id` to the `BudgetPlanBankAccount` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BudgetPlanAllocation" DROP CONSTRAINT "BudgetPlanAllocation_budget_plan_darft_id_fkey";

-- DropForeignKey
ALTER TABLE "BudgetPlanBankAccount" DROP CONSTRAINT "BudgetPlanBankAccount_accountId_fkey";

-- DropForeignKey
ALTER TABLE "BudgetPlanBankAccount" DROP CONSTRAINT "BudgetPlanBankAccount_bankId_fkey";

-- DropForeignKey
ALTER TABLE "BudgetPlanBankAccount" DROP CONSTRAINT "BudgetPlanBankAccount_budgetPlanDraftId_fkey";

-- DropForeignKey
ALTER TABLE "BudgetPlanBankAccount" DROP CONSTRAINT "BudgetPlanBankAccount_budgetPlanId_fkey";

-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "is_archived" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "BudgetPlanAllocation" DROP COLUMN "budget_plan_darft_id",
ADD COLUMN     "budget_plan_draft_id" UUID;

-- AlterTable
ALTER TABLE "BudgetPlanBankAccount" DROP COLUMN "accountId",
DROP COLUMN "bankId",
DROP COLUMN "budgetPlanDraftId",
DROP COLUMN "budgetPlanId",
ADD COLUMN     "account_id" UUID NOT NULL,
ADD COLUMN     "bank_id" UUID NOT NULL,
ADD COLUMN     "budget_plan_draft_id" UUID,
ADD COLUMN     "budget_plan_id" UUID;

-- AlterTable
ALTER TABLE "ClientDraft" ALTER COLUMN "emails" SET DEFAULT ARRAY[]::VARCHAR(55)[],
ALTER COLUMN "contacts" SET DEFAULT ARRAY[]::VARCHAR(50)[];

-- AlterTable
ALTER TABLE "Report" DROP COLUMN "createdBy",
ADD COLUMN     "created_by" VARCHAR(150),
ALTER COLUMN "isins" SET DEFAULT ARRAY[]::VARCHAR(50)[];

-- AlterTable
ALTER TABLE "ReportDraft" ALTER COLUMN "isins" SET DEFAULT ARRAY[]::VARCHAR(50)[];

-- AddForeignKey
ALTER TABLE "BudgetPlanBankAccount" ADD CONSTRAINT "BudgetPlanBankAccount_bank_id_fkey" FOREIGN KEY ("bank_id") REFERENCES "Bank"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetPlanBankAccount" ADD CONSTRAINT "BudgetPlanBankAccount_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetPlanBankAccount" ADD CONSTRAINT "BudgetPlanBankAccount_budget_plan_id_fkey" FOREIGN KEY ("budget_plan_id") REFERENCES "BudgetPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetPlanBankAccount" ADD CONSTRAINT "BudgetPlanBankAccount_budget_plan_draft_id_fkey" FOREIGN KEY ("budget_plan_draft_id") REFERENCES "BudgetPlanDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetPlanAllocation" ADD CONSTRAINT "BudgetPlanAllocation_budget_plan_draft_id_fkey" FOREIGN KEY ("budget_plan_draft_id") REFERENCES "BudgetPlanDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;
