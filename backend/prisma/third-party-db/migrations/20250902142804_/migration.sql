-- CreateTable
CREATE TABLE "Emitent" (
    "id" TEXT NOT NULL,
    "branch_name_eng" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Emitent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Emitent_id_key" ON "Emitent"("id");

-- CreateIndex
CREATE INDEX "Emitent_id_idx" ON "Emitent"("id");

-- CreateIndex
CREATE INDEX "BondHistory_createdAt_idx" ON "BondHistory"("createdAt");

-- CreateIndex
CREATE INDEX "EquityHistory_createdAt_idx" ON "EquityHistory"("createdAt");

-- CreateIndex
CREATE INDEX "EtfHistory_createdAt_idx" ON "EtfHistory"("createdAt");
