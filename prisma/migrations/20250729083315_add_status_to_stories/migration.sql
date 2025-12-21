-- AlterTable
ALTER TABLE "chapters" ADD COLUMN     "is_hidden" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "scheduled_date" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'draft';

-- AlterTable
ALTER TABLE "stories" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'draft';
