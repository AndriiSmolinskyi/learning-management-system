-- CreateTable
CREATE TABLE "CurrencyHistoryData" (
    "id" UUID NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "currency_id" UUID NOT NULL,

    CONSTRAINT "CurrencyHistoryData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetalHistoryData" (
    "id" UUID NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "currency_id" UUID NOT NULL,

    CONSTRAINT "MetalHistoryData_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CurrencyHistoryData" ADD CONSTRAINT "CurrencyHistoryData_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "CurrencyData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetalHistoryData" ADD CONSTRAINT "MetalHistoryData_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "MetalData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
