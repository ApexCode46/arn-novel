/*
  Warnings:

  - Added the required column `file_name` to the `voice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_path` to the `voice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_size` to the `voice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `voice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "voice" ADD COLUMN     "chapter_id" TEXT,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "duration" DOUBLE PRECISION,
ADD COLUMN     "file_name" TEXT NOT NULL,
ADD COLUMN     "file_path" TEXT NOT NULL,
ADD COLUMN     "file_size" INTEGER NOT NULL,
ADD COLUMN     "is_public" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "price" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "voice" ADD CONSTRAINT "voice_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "chapters"("chapter_id") ON DELETE SET NULL ON UPDATE CASCADE;
