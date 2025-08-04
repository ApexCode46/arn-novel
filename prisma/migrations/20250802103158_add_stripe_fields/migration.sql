-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED');

-- AlterTable
ALTER TABLE "transaction" ADD COLUMN     "coin_package_id" TEXT,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'THB',
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "payment_method" TEXT,
ADD COLUMN     "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "stripe_charge_id" TEXT,
ADD COLUMN     "stripe_payment_intent_id" TEXT;

-- CreateTable
CREATE TABLE "coinPackage" (
    "package_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "bonus" INTEGER NOT NULL DEFAULT 0,
    "price" INTEGER NOT NULL,
    "original_price" INTEGER,
    "is_popular" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coinPackage_pkey" PRIMARY KEY ("package_id")
);

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_coin_package_id_fkey" FOREIGN KEY ("coin_package_id") REFERENCES "coinPackage"("package_id") ON DELETE SET NULL ON UPDATE CASCADE;
