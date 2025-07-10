/*
  Warnings:

  - You are about to drop the column `description` on the `stories` table. All the data in the column will be lost.
  - You are about to drop the column `story_img` on the `stories` table. All the data in the column will be lost.
  - Added the required column `allowComments` to the `stories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `commentPermission` to the `stories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hideComments` to the `stories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `penName` to the `stories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storyInfo` to the `stories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `verticalImage` to the `stories` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "stories" DROP COLUMN "description",
DROP COLUMN "story_img",
ADD COLUMN     "allowComments" BOOLEAN NOT NULL,
ADD COLUMN     "blurb" TEXT,
ADD COLUMN     "commentPermission" TEXT NOT NULL,
ADD COLUMN     "hideComments" BOOLEAN NOT NULL,
ADD COLUMN     "horizontalImage" TEXT,
ADD COLUMN     "penName" TEXT NOT NULL,
ADD COLUMN     "storyInfo" TEXT NOT NULL,
ADD COLUMN     "verticalImage" TEXT NOT NULL;
