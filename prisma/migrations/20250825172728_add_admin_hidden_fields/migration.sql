-- AlterTable
ALTER TABLE "public"."chapters" ADD COLUMN     "admin_hidden" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "admin_hide_reason" TEXT;

-- AlterTable
ALTER TABLE "public"."stories" ADD COLUMN     "admin_hidden" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "admin_hide_reason" TEXT;
