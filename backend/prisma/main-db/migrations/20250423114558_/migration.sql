-- AlterTable
ALTER TABLE "ClientDraft" ALTER COLUMN "emails" SET DEFAULT ARRAY[]::VARCHAR(55)[],
ALTER COLUMN "contacts" SET DEFAULT ARRAY[]::VARCHAR(50)[];

-- AlterTable
ALTER TABLE "Report" ALTER COLUMN "isins" SET DEFAULT ARRAY[]::VARCHAR(50)[];

-- AlterTable
ALTER TABLE "ReportDraft" ALTER COLUMN "isins" SET DEFAULT ARRAY[]::VARCHAR(50)[];

-- CreateTable
CREATE TABLE "ExpenseCategoryList" (
    "id" UUID NOT NULL,
    "client_id" UUID,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExpenseCategoryList_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExpenseCategoryList_id_key" ON "ExpenseCategoryList"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ExpenseCategoryList_name_key" ON "ExpenseCategoryList"("name");

-- AddForeignKey
ALTER TABLE "ExpenseCategoryList" ADD CONSTRAINT "ExpenseCategoryList_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
