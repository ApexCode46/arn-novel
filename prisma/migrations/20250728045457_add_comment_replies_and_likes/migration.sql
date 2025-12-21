-- AlterTable
ALTER TABLE "chapterComments" ADD COLUMN     "parent_id" TEXT;

-- AlterTable
ALTER TABLE "stories" ALTER COLUMN "verticalImage" DROP NOT NULL;

-- CreateTable
CREATE TABLE "commentLikes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "chapterComment_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commentLikes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "commentLikes_user_id_chapterComment_id_key" ON "commentLikes"("user_id", "chapterComment_id");

-- AddForeignKey
ALTER TABLE "chapterComments" ADD CONSTRAINT "chapterComments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "chapterComments"("chapterComment_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commentLikes" ADD CONSTRAINT "commentLikes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commentLikes" ADD CONSTRAINT "commentLikes_chapterComment_id_fkey" FOREIGN KEY ("chapterComment_id") REFERENCES "chapterComments"("chapterComment_id") ON DELETE RESTRICT ON UPDATE CASCADE;
