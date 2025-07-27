/*
  Warnings:

  - Added the required column `order` to the `chapters` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "chapters" ADD COLUMN     "order" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "stories" ADD COLUMN     "contentLevel" TEXT NOT NULL DEFAULT 'PG',
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'เรื่องสั้น',
ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "storyInfo" DROP NOT NULL;
