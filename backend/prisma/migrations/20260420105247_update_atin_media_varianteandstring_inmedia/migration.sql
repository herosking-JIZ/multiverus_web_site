/*
  Warnings:

  - Added the required column `updated_at` to the `media_variantes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "media_variantes" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "medias" ALTER COLUMN "url" DROP NOT NULL;
