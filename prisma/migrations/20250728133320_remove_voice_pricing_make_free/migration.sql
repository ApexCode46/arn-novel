/*
  Warnings:

  - You are about to drop the column `is_public` on the `voice` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `voice` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "voice" DROP COLUMN "is_public",
DROP COLUMN "price";
