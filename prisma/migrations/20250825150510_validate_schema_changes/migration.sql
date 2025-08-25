/*
  Warnings:

  - Added the required column `numBank` to the `register_writers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `register_writers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."register_writers" ADD COLUMN     "numBank" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL;
