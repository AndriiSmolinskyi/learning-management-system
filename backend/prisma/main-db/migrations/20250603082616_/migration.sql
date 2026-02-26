-- AlterTable
ALTER TABLE "Bank" ADD COLUMN     "bank_list_id" UUID;

-- AlterTable
ALTER TABLE "ClientDraft" ALTER COLUMN "emails" SET DEFAULT ARRAY[]::VARCHAR(55)[],
ALTER COLUMN "contacts" SET DEFAULT ARRAY[]::VARCHAR(50)[];

-- AlterTable
ALTER TABLE "Report" ALTER COLUMN "isins" SET DEFAULT ARRAY[]::VARCHAR(50)[];

-- AlterTable
ALTER TABLE "ReportDraft" ALTER COLUMN "isins" SET DEFAULT ARRAY[]::VARCHAR(50)[];

-- AddForeignKey
ALTER TABLE "Bank" ADD CONSTRAINT "Bank_bank_list_id_fkey" FOREIGN KEY ("bank_list_id") REFERENCES "BankList"("id") ON DELETE SET NULL ON UPDATE CASCADE;
