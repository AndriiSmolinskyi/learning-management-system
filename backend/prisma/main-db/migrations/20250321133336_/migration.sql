-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING', 'APPROVED', 'DECLINED');

-- CreateEnum
CREATE TYPE "RequestType" AS ENUM ('Sell', 'Buy', 'Deposit', 'Other');

-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('Buy', 'Sell');

-- CreateEnum
CREATE TYPE "CurrencyDataList" AS ENUM ('AED', 'AUD', 'BRL', 'CAD', 'CHF', 'EUR', 'GBP', 'HKD', 'ILS', 'JPY', 'MXN', 'NOK', 'RUB', 'TRY', 'USD', 'ZAR', 'DKK', 'SEK', 'KRW', 'CNY', 'KZT');

-- CreateTable
CREATE TABLE "Client" (
    "id" UUID NOT NULL,
    "first_name" VARCHAR(50) NOT NULL,
    "last_name" VARCHAR(50) NOT NULL,
    "residence" VARCHAR(50) NOT NULL,
    "country" VARCHAR(50) NOT NULL,
    "region" VARCHAR(50) NOT NULL,
    "city" VARCHAR(50) NOT NULL,
    "street_address" TEXT NOT NULL,
    "building_number" TEXT NOT NULL,
    "postal_code" TEXT NOT NULL,
    "is_activated" BOOLEAN NOT NULL DEFAULT true,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientDraft" (
    "id" UUID NOT NULL,
    "first_name" VARCHAR(50),
    "last_name" VARCHAR(50),
    "residence" VARCHAR(50),
    "country" VARCHAR(50),
    "region" VARCHAR(50),
    "city" VARCHAR(50),
    "street_address" TEXT,
    "building_number" TEXT,
    "postal_code" TEXT,
    "emails" VARCHAR(55)[] DEFAULT ARRAY[]::VARCHAR(55)[],
    "contacts" VARCHAR(50)[] DEFAULT ARRAY[]::VARCHAR(50)[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "email_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Email" (
    "id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "email" VARCHAR(55) NOT NULL,
    "password" VARCHAR(255),
    "token" TEXT,
    "is_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Email_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phone" (
    "id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "number" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Phone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" UUID NOT NULL,
    "client_id" UUID,
    "client_draft_id" UUID,
    "portfolio_id" UUID,
    "portfolio_draft_id" UUID,
    "entity_id" UUID,
    "asset_id" UUID,
    "request_id" INTEGER,
    "request_draft_id" INTEGER,
    "transaction_id" INTEGER,
    "transaction_draft_id" INTEGER,
    "report_id" INTEGER,
    "report_draft_id" INTEGER,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL,
    "format" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "preview" TEXT NOT NULL,
    "comment" TEXT,
    "storage_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankList" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BankList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransactionType" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "pl" TEXT,
    "cash_flow" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransactionType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Portfolio" (
    "id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "resident" TEXT,
    "tax_resident" TEXT,
    "is_activated" BOOLEAN NOT NULL DEFAULT true,
    "main_portfolio_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Portfolio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortfolioDraft" (
    "id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "resident" TEXT,
    "tax_resident" TEXT,
    "main_portfolio_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PortfolioDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entity" (
    "id" UUID NOT NULL,
    "portfolio_id" UUID,
    "portfolio_draft_id" UUID,
    "name" VARCHAR(50) NOT NULL,
    "country" VARCHAR(50) NOT NULL,
    "authorized_signatory_name" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "email" VARCHAR(55),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Entity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bank" (
    "id" UUID NOT NULL,
    "portfolio_id" UUID,
    "portfolio_draft_id" UUID,
    "entity_id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "bank_name" VARCHAR(50) NOT NULL,
    "country" VARCHAR(50) NOT NULL,
    "branch_name" VARCHAR(50) NOT NULL,
    "first_name" VARCHAR(50),
    "last_name" VARCHAR(50),
    "email" VARCHAR(55),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" UUID NOT NULL,
    "portfolio_id" UUID,
    "portfolio_draft_id" UUID,
    "entity_id" UUID NOT NULL,
    "bank_id" UUID NOT NULL,
    "account_name" VARCHAR(50) NOT NULL,
    "management_fee" VARCHAR(50) NOT NULL,
    "hold_fee" VARCHAR(50) NOT NULL,
    "sell_fee" VARCHAR(50) NOT NULL,
    "buy_fee" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "data_created" TIMESTAMP(3),
    "iban" VARCHAR(50),
    "account_number" VARCHAR(50),
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" UUID NOT NULL,
    "portfolio_id" UUID,
    "portfolio_draft_id" UUID,
    "entity_id" UUID NOT NULL,
    "bank_id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "asset_name" VARCHAR(50) NOT NULL,
    "payload" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Request" (
    "id" SERIAL NOT NULL,
    "client_id" UUID NOT NULL,
    "portfolio_id" UUID NOT NULL,
    "entity_id" UUID NOT NULL,
    "bank_id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "asset_id" UUID,
    "type" "RequestType" NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'Not started',
    "amount" VARCHAR(50),
    "comment" TEXT,
    "order_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestDraft" (
    "id" SERIAL NOT NULL,
    "client_id" UUID,
    "portfolio_id" UUID,
    "entity_id" UUID,
    "bank_id" UUID,
    "account_id" UUID,
    "type" "RequestType" NOT NULL,
    "amount" VARCHAR(50),
    "asset_id" UUID,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RequestDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "type" "OrderType" NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'In progress',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "portfolio_id" UUID NOT NULL,
    "request_id" INTEGER NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderDetails" (
    "id" UUID NOT NULL,
    "order_id" INTEGER NOT NULL,
    "security" VARCHAR(50) NOT NULL,
    "isin" VARCHAR(50) NOT NULL,
    "units" VARCHAR(50) NOT NULL,
    "price" VARCHAR(50) NOT NULL,
    "currency" VARCHAR(10) NOT NULL,
    "unit_executed" VARCHAR(50) NOT NULL DEFAULT '0',
    "price_executed" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderDraft" (
    "id" SERIAL NOT NULL,
    "type" "OrderType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "portfolio_id" UUID,
    "request_id" INTEGER,

    CONSTRAINT "OrderDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderDraftDetails" (
    "id" UUID NOT NULL,
    "order_draft_id" INTEGER NOT NULL,
    "security" VARCHAR(50),
    "isin" VARCHAR(50),
    "units" VARCHAR(50),
    "price" VARCHAR(50),
    "currency" VARCHAR(10),
    "unit_executed" VARCHAR(50) DEFAULT '0',
    "price_executed" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderDraftDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "transaction_type_id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "portfolio_id" UUID NOT NULL,
    "entity_id" UUID,
    "bank_id" UUID NOT NULL,
    "account_id" UUID,
    "order_id" INTEGER,
    "expense_category_id" UUID,
    "isin" VARCHAR(50),
    "security" VARCHAR(50),
    "service_provider" VARCHAR(50),
    "currency" VARCHAR(10) NOT NULL,
    "amount" DECIMAL(65,2) NOT NULL,
    "transaction_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comment" TEXT,
    "custom_fields" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransactionDraft" (
    "id" SERIAL NOT NULL,
    "transaction_type_id" UUID,
    "client_id" UUID,
    "portfolio_id" UUID,
    "entity_id" UUID,
    "bank_id" UUID,
    "account_id" UUID,
    "order_id" INTEGER,
    "isin" VARCHAR(50),
    "security" VARCHAR(50),
    "service_provider" VARCHAR(50),
    "currency" VARCHAR(3),
    "amount" DECIMAL(65,2),
    "transaction_date" TIMESTAMP(3),
    "comment" TEXT,
    "custom_fields" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransactionDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetPlan" (
    "id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "is_activated" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BudgetPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetPlanDraft" (
    "id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BudgetPlanDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetPlanBankAccount" (
    "id" UUID NOT NULL,
    "bankId" UUID NOT NULL,
    "accountId" UUID NOT NULL,
    "budgetPlanId" UUID,
    "budgetPlanDraftId" UUID
);

-- CreateTable
CREATE TABLE "BudgetPlanAllocation" (
    "id" UUID NOT NULL,
    "budget_plan_id" UUID,
    "currency" "CurrencyDataList" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "budget" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "budget_plan_darft_id" UUID,
    "account_id" UUID NOT NULL,

    CONSTRAINT "BudgetPlanAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpenseCategory" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "budget" DOUBLE PRECISION NOT NULL,
    "budget_plan_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExpenseCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" SERIAL NOT NULL,
    "client_id" UUID,
    "portfolio_id" UUID,
    "type" VARCHAR(50) NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "isins" VARCHAR(50)[] DEFAULT ARRAY[]::VARCHAR(50)[],
    "name" VARCHAR(100) NOT NULL,
    "payload" JSONB,
    "createdBy" VARCHAR(150),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportDraft" (
    "id" SERIAL NOT NULL,
    "client_id" UUID,
    "portfolio_id" UUID,
    "type" VARCHAR(50) NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "isins" VARCHAR(50)[] DEFAULT ARRAY[]::VARCHAR(50)[],
    "name" VARCHAR(100) NOT NULL,
    "payload" JSONB,
    "created_by" VARCHAR(150),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_client_id_key" ON "User"("client_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_id_key" ON "User"("email_id");

-- CreateIndex
CREATE UNIQUE INDEX "Email_email_key" ON "Email"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Email_token_key" ON "Email"("token");

-- CreateIndex
CREATE INDEX "Email_email_idx" ON "Email"("email");

-- CreateIndex
CREATE INDEX "Email_client_id_idx" ON "Email"("client_id");

-- CreateIndex
CREATE UNIQUE INDEX "Phone_number_key" ON "Phone"("number");

-- CreateIndex
CREATE INDEX "Phone_number_idx" ON "Phone"("number");

-- CreateIndex
CREATE INDEX "Phone_client_id_idx" ON "Phone"("client_id");

-- CreateIndex
CREATE INDEX "Document_client_id_idx" ON "Document"("client_id");

-- CreateIndex
CREATE INDEX "Document_client_draft_id_idx" ON "Document"("client_draft_id");

-- CreateIndex
CREATE INDEX "Document_portfolio_id_idx" ON "Document"("portfolio_id");

-- CreateIndex
CREATE INDEX "Document_portfolio_draft_id_idx" ON "Document"("portfolio_draft_id");

-- CreateIndex
CREATE INDEX "Document_entity_id_idx" ON "Document"("entity_id");

-- CreateIndex
CREATE INDEX "Document_asset_id_idx" ON "Document"("asset_id");

-- CreateIndex
CREATE INDEX "Document_request_id_idx" ON "Document"("request_id");

-- CreateIndex
CREATE INDEX "Document_request_draft_id_idx" ON "Document"("request_draft_id");

-- CreateIndex
CREATE INDEX "Document_transaction_id_idx" ON "Document"("transaction_id");

-- CreateIndex
CREATE INDEX "Document_transaction_draft_id_idx" ON "Document"("transaction_draft_id");

-- CreateIndex
CREATE UNIQUE INDEX "BankList_id_key" ON "BankList"("id");

-- CreateIndex
CREATE UNIQUE INDEX "BankList_name_key" ON "BankList"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TransactionType_id_key" ON "TransactionType"("id");

-- CreateIndex
CREATE INDEX "TransactionType_name_idx" ON "TransactionType"("name");

-- CreateIndex
CREATE INDEX "TransactionType_category_idx" ON "TransactionType"("category");

-- CreateIndex
CREATE UNIQUE INDEX "Portfolio_id_key" ON "Portfolio"("id");

-- CreateIndex
CREATE INDEX "Portfolio_client_id_idx" ON "Portfolio"("client_id");

-- CreateIndex
CREATE INDEX "Portfolio_main_portfolio_id_idx" ON "Portfolio"("main_portfolio_id");

-- CreateIndex
CREATE INDEX "Portfolio_type_idx" ON "Portfolio"("type");

-- CreateIndex
CREATE INDEX "Portfolio_is_activated_idx" ON "Portfolio"("is_activated");

-- CreateIndex
CREATE UNIQUE INDEX "PortfolioDraft_id_key" ON "PortfolioDraft"("id");

-- CreateIndex
CREATE INDEX "PortfolioDraft_client_id_idx" ON "PortfolioDraft"("client_id");

-- CreateIndex
CREATE INDEX "PortfolioDraft_main_portfolio_id_idx" ON "PortfolioDraft"("main_portfolio_id");

-- CreateIndex
CREATE UNIQUE INDEX "Entity_id_key" ON "Entity"("id");

-- CreateIndex
CREATE INDEX "Entity_portfolio_id_idx" ON "Entity"("portfolio_id");

-- CreateIndex
CREATE INDEX "Entity_portfolio_draft_id_idx" ON "Entity"("portfolio_draft_id");

-- CreateIndex
CREATE INDEX "Entity_name_idx" ON "Entity"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Bank_id_key" ON "Bank"("id");

-- CreateIndex
CREATE INDEX "Bank_portfolio_id_idx" ON "Bank"("portfolio_id");

-- CreateIndex
CREATE INDEX "Bank_portfolio_draft_id_idx" ON "Bank"("portfolio_draft_id");

-- CreateIndex
CREATE INDEX "Bank_entity_id_idx" ON "Bank"("entity_id");

-- CreateIndex
CREATE INDEX "Bank_bank_name_idx" ON "Bank"("bank_name");

-- CreateIndex
CREATE INDEX "Bank_client_id_idx" ON "Bank"("client_id");

-- CreateIndex
CREATE UNIQUE INDEX "Account_id_key" ON "Account"("id");

-- CreateIndex
CREATE INDEX "Account_portfolio_id_idx" ON "Account"("portfolio_id");

-- CreateIndex
CREATE INDEX "Account_portfolio_draft_id_idx" ON "Account"("portfolio_draft_id");

-- CreateIndex
CREATE INDEX "Account_entity_id_idx" ON "Account"("entity_id");

-- CreateIndex
CREATE INDEX "Account_bank_id_idx" ON "Account"("bank_id");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_id_key" ON "Asset"("id");

-- CreateIndex
CREATE INDEX "Asset_portfolio_id_idx" ON "Asset"("portfolio_id");

-- CreateIndex
CREATE INDEX "Asset_portfolio_draft_id_idx" ON "Asset"("portfolio_draft_id");

-- CreateIndex
CREATE INDEX "Asset_entity_id_idx" ON "Asset"("entity_id");

-- CreateIndex
CREATE INDEX "Asset_bank_id_idx" ON "Asset"("bank_id");

-- CreateIndex
CREATE INDEX "Asset_account_id_idx" ON "Asset"("account_id");

-- CreateIndex
CREATE INDEX "Asset_client_id_idx" ON "Asset"("client_id");

-- CreateIndex
CREATE INDEX "Asset_asset_name_idx" ON "Asset"("asset_name");

-- CreateIndex
CREATE INDEX "Request_client_id_idx" ON "Request"("client_id");

-- CreateIndex
CREATE INDEX "Request_portfolio_id_idx" ON "Request"("portfolio_id");

-- CreateIndex
CREATE INDEX "Request_entity_id_idx" ON "Request"("entity_id");

-- CreateIndex
CREATE INDEX "Request_bank_id_idx" ON "Request"("bank_id");

-- CreateIndex
CREATE INDEX "Request_account_id_idx" ON "Request"("account_id");

-- CreateIndex
CREATE INDEX "Request_asset_id_idx" ON "Request"("asset_id");

-- CreateIndex
CREATE INDEX "Request_type_idx" ON "Request"("type");

-- CreateIndex
CREATE INDEX "Request_status_idx" ON "Request"("status");

-- CreateIndex
CREATE INDEX "RequestDraft_client_id_idx" ON "RequestDraft"("client_id");

-- CreateIndex
CREATE INDEX "RequestDraft_portfolio_id_idx" ON "RequestDraft"("portfolio_id");

-- CreateIndex
CREATE INDEX "RequestDraft_entity_id_idx" ON "RequestDraft"("entity_id");

-- CreateIndex
CREATE INDEX "RequestDraft_bank_id_idx" ON "RequestDraft"("bank_id");

-- CreateIndex
CREATE INDEX "RequestDraft_account_id_idx" ON "RequestDraft"("account_id");

-- CreateIndex
CREATE INDEX "RequestDraft_asset_id_idx" ON "RequestDraft"("asset_id");

-- CreateIndex
CREATE INDEX "RequestDraft_type_idx" ON "RequestDraft"("type");

-- CreateIndex
CREATE INDEX "Order_type_idx" ON "Order"("type");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_portfolio_id_idx" ON "Order"("portfolio_id");

-- CreateIndex
CREATE INDEX "Order_request_id_idx" ON "Order"("request_id");

-- CreateIndex
CREATE INDEX "OrderDetails_order_id_idx" ON "OrderDetails"("order_id");

-- CreateIndex
CREATE INDEX "OrderDraft_type_idx" ON "OrderDraft"("type");

-- CreateIndex
CREATE INDEX "OrderDraft_portfolio_id_idx" ON "OrderDraft"("portfolio_id");

-- CreateIndex
CREATE INDEX "OrderDraft_request_id_idx" ON "OrderDraft"("request_id");

-- CreateIndex
CREATE INDEX "OrderDraftDetails_order_draft_id_idx" ON "OrderDraftDetails"("order_draft_id");

-- CreateIndex
CREATE INDEX "Transaction_entity_id_idx" ON "Transaction"("entity_id");

-- CreateIndex
CREATE INDEX "Transaction_client_id_idx" ON "Transaction"("client_id");

-- CreateIndex
CREATE INDEX "Transaction_portfolio_id_idx" ON "Transaction"("portfolio_id");

-- CreateIndex
CREATE INDEX "Transaction_bank_id_idx" ON "Transaction"("bank_id");

-- CreateIndex
CREATE INDEX "Transaction_account_id_idx" ON "Transaction"("account_id");

-- CreateIndex
CREATE INDEX "Transaction_order_id_idx" ON "Transaction"("order_id");

-- CreateIndex
CREATE INDEX "Transaction_currency_idx" ON "Transaction"("currency");

-- CreateIndex
CREATE INDEX "TransactionDraft_entity_id_idx" ON "TransactionDraft"("entity_id");

-- CreateIndex
CREATE INDEX "TransactionDraft_client_id_idx" ON "TransactionDraft"("client_id");

-- CreateIndex
CREATE INDEX "TransactionDraft_portfolio_id_idx" ON "TransactionDraft"("portfolio_id");

-- CreateIndex
CREATE INDEX "TransactionDraft_bank_id_idx" ON "TransactionDraft"("bank_id");

-- CreateIndex
CREATE INDEX "TransactionDraft_account_id_idx" ON "TransactionDraft"("account_id");

-- CreateIndex
CREATE INDEX "TransactionDraft_order_id_idx" ON "TransactionDraft"("order_id");

-- CreateIndex
CREATE INDEX "TransactionDraft_currency_idx" ON "TransactionDraft"("currency");

-- CreateIndex
CREATE UNIQUE INDEX "BudgetPlan_id_key" ON "BudgetPlan"("id");

-- CreateIndex
CREATE UNIQUE INDEX "BudgetPlan_client_id_key" ON "BudgetPlan"("client_id");

-- CreateIndex
CREATE UNIQUE INDEX "BudgetPlanDraft_id_key" ON "BudgetPlanDraft"("id");

-- CreateIndex
CREATE UNIQUE INDEX "BudgetPlanDraft_client_id_key" ON "BudgetPlanDraft"("client_id");

-- CreateIndex
CREATE UNIQUE INDEX "BudgetPlanBankAccount_id_key" ON "BudgetPlanBankAccount"("id");

-- CreateIndex
CREATE UNIQUE INDEX "BudgetPlanAllocation_id_key" ON "BudgetPlanAllocation"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ExpenseCategory_id_key" ON "ExpenseCategory"("id");

-- CreateIndex
CREATE INDEX "ExpenseCategory_name_idx" ON "ExpenseCategory"("name");

-- CreateIndex
CREATE INDEX "ExpenseCategory_budget_idx" ON "ExpenseCategory"("budget");

-- CreateIndex
CREATE INDEX "Report_type_idx" ON "Report"("type");

-- CreateIndex
CREATE INDEX "Report_category_idx" ON "Report"("category");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_email_id_fkey" FOREIGN KEY ("email_id") REFERENCES "Email"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Email" ADD CONSTRAINT "Email_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phone" ADD CONSTRAINT "Phone_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_client_draft_id_fkey" FOREIGN KEY ("client_draft_id") REFERENCES "ClientDraft"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "Portfolio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_portfolio_draft_id_fkey" FOREIGN KEY ("portfolio_draft_id") REFERENCES "PortfolioDraft"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "Entity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "Request"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_request_draft_id_fkey" FOREIGN KEY ("request_draft_id") REFERENCES "RequestDraft"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_transaction_draft_id_fkey" FOREIGN KEY ("transaction_draft_id") REFERENCES "TransactionDraft"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "Report"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_report_draft_id_fkey" FOREIGN KEY ("report_draft_id") REFERENCES "ReportDraft"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Portfolio" ADD CONSTRAINT "Portfolio_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioDraft" ADD CONSTRAINT "PortfolioDraft_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entity" ADD CONSTRAINT "Entity_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entity" ADD CONSTRAINT "Entity_portfolio_draft_id_fkey" FOREIGN KEY ("portfolio_draft_id") REFERENCES "PortfolioDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bank" ADD CONSTRAINT "Bank_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bank" ADD CONSTRAINT "Bank_portfolio_draft_id_fkey" FOREIGN KEY ("portfolio_draft_id") REFERENCES "PortfolioDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bank" ADD CONSTRAINT "Bank_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bank" ADD CONSTRAINT "Bank_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_portfolio_draft_id_fkey" FOREIGN KEY ("portfolio_draft_id") REFERENCES "PortfolioDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_bank_id_fkey" FOREIGN KEY ("bank_id") REFERENCES "Bank"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_portfolio_draft_id_fkey" FOREIGN KEY ("portfolio_draft_id") REFERENCES "PortfolioDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_bank_id_fkey" FOREIGN KEY ("bank_id") REFERENCES "Bank"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_bank_id_fkey" FOREIGN KEY ("bank_id") REFERENCES "Bank"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestDraft" ADD CONSTRAINT "RequestDraft_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestDraft" ADD CONSTRAINT "RequestDraft_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestDraft" ADD CONSTRAINT "RequestDraft_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestDraft" ADD CONSTRAINT "RequestDraft_bank_id_fkey" FOREIGN KEY ("bank_id") REFERENCES "Bank"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestDraft" ADD CONSTRAINT "RequestDraft_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestDraft" ADD CONSTRAINT "RequestDraft_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderDetails" ADD CONSTRAINT "OrderDetails_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderDraft" ADD CONSTRAINT "OrderDraft_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "Portfolio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderDraft" ADD CONSTRAINT "OrderDraft_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "Request"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderDraftDetails" ADD CONSTRAINT "OrderDraftDetails_order_draft_id_fkey" FOREIGN KEY ("order_draft_id") REFERENCES "OrderDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_transaction_type_id_fkey" FOREIGN KEY ("transaction_type_id") REFERENCES "TransactionType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_bank_id_fkey" FOREIGN KEY ("bank_id") REFERENCES "Bank"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_expense_category_id_fkey" FOREIGN KEY ("expense_category_id") REFERENCES "ExpenseCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionDraft" ADD CONSTRAINT "TransactionDraft_transaction_type_id_fkey" FOREIGN KEY ("transaction_type_id") REFERENCES "TransactionType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionDraft" ADD CONSTRAINT "TransactionDraft_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionDraft" ADD CONSTRAINT "TransactionDraft_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionDraft" ADD CONSTRAINT "TransactionDraft_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionDraft" ADD CONSTRAINT "TransactionDraft_bank_id_fkey" FOREIGN KEY ("bank_id") REFERENCES "Bank"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionDraft" ADD CONSTRAINT "TransactionDraft_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionDraft" ADD CONSTRAINT "TransactionDraft_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetPlan" ADD CONSTRAINT "BudgetPlan_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetPlanDraft" ADD CONSTRAINT "BudgetPlanDraft_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetPlanBankAccount" ADD CONSTRAINT "BudgetPlanBankAccount_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "Bank"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetPlanBankAccount" ADD CONSTRAINT "BudgetPlanBankAccount_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetPlanBankAccount" ADD CONSTRAINT "BudgetPlanBankAccount_budgetPlanId_fkey" FOREIGN KEY ("budgetPlanId") REFERENCES "BudgetPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetPlanBankAccount" ADD CONSTRAINT "BudgetPlanBankAccount_budgetPlanDraftId_fkey" FOREIGN KEY ("budgetPlanDraftId") REFERENCES "BudgetPlanDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetPlanAllocation" ADD CONSTRAINT "BudgetPlanAllocation_budget_plan_id_fkey" FOREIGN KEY ("budget_plan_id") REFERENCES "BudgetPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetPlanAllocation" ADD CONSTRAINT "BudgetPlanAllocation_budget_plan_darft_id_fkey" FOREIGN KEY ("budget_plan_darft_id") REFERENCES "BudgetPlanDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetPlanAllocation" ADD CONSTRAINT "BudgetPlanAllocation_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseCategory" ADD CONSTRAINT "ExpenseCategory_budget_plan_id_fkey" FOREIGN KEY ("budget_plan_id") REFERENCES "BudgetPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportDraft" ADD CONSTRAINT "ReportDraft_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportDraft" ADD CONSTRAINT "ReportDraft_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
