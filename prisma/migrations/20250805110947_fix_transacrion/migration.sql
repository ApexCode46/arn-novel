/*
  Warnings:

  - You are about to drop the column `voice_id` on the `transaction` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "transaction" DROP CONSTRAINT "transaction_voice_id_fkey";

-- AlterTable
ALTER TABLE "transaction" DROP COLUMN "voice_id",
ADD COLUMN     "story_id" TEXT;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "stories"("story_id") ON DELETE SET NULL ON UPDATE CASCADE;
