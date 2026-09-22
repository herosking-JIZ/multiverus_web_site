/*
  Warnings:

  - You are about to drop the column `logo_url` on the `partenaires` table. All the data in the column will be lost.
  - You are about to drop the column `image_url` on the `produits` table. All the data in the column will be lost.
  - You are about to drop the column `logo_client_url` on the `projets` table. All the data in the column will be lost.
  - You are about to drop the column `image_url` on the `services` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[s3_key]` on the table `medias` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `s3_bucket` to the `medias` table without a default value. This is not possible if the table is not empty.
  - Added the required column `s3_key` to the `medias` table without a default value. This is not possible if the table is not empty.
  - Added the required column `s3_region` to the `medias` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `medias` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "upload_status" AS ENUM ('PENDING', 'UPLOADED', 'FAILED');

-- CreateEnum
CREATE TYPE "visibilite" AS ENUM ('PUBLIC', 'PRIVE');

-- CreateEnum
CREATE TYPE "type_variante" AS ENUM ('THUMBNAIL', 'WEBP', 'HD', 'SD');

-- AlterTable
ALTER TABLE "medias" ADD COLUMN     "cdn_url" VARCHAR(500),
ADD COLUMN     "duree_secondes" INTEGER,
ADD COLUMN     "hauteur" INTEGER,
ADD COLUMN     "largeur" INTEGER,
ADD COLUMN     "s3_bucket" VARCHAR(200) NOT NULL,
ADD COLUMN     "s3_key" VARCHAR(500) NOT NULL,
ADD COLUMN     "s3_region" VARCHAR(50) NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "upload_expires_at" TIMESTAMP(3),
ADD COLUMN     "upload_status" "upload_status" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "visibilite" "visibilite" NOT NULL DEFAULT 'PUBLIC';

-- AlterTable
ALTER TABLE "partenaires" DROP COLUMN "logo_url",
ADD COLUMN     "logo_id" UUID;

-- AlterTable
ALTER TABLE "produits" DROP COLUMN "image_url",
ADD COLUMN     "image_id" UUID;

-- AlterTable
ALTER TABLE "projets" DROP COLUMN "logo_client_url",
ADD COLUMN     "logo_id" UUID;

-- AlterTable
ALTER TABLE "services" DROP COLUMN "image_url",
ADD COLUMN     "image_id" UUID;

-- CreateTable
CREATE TABLE "media_variantes" (
    "id" UUID NOT NULL,
    "media_id" UUID NOT NULL,
    "type" "type_variante" NOT NULL,
    "s3_key" VARCHAR(500) NOT NULL,
    "cdn_url" VARCHAR(500),
    "largeur" INTEGER,
    "hauteur" INTEGER,
    "taille_octets" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_variantes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "media_variantes_media_id_idx" ON "media_variantes"("media_id");

-- CreateIndex
CREATE INDEX "media_variantes_type_idx" ON "media_variantes"("type");

-- CreateIndex
CREATE UNIQUE INDEX "media_variantes_media_id_type_key" ON "media_variantes"("media_id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "medias_s3_key_key" ON "medias"("s3_key");

-- CreateIndex
CREATE INDEX "medias_s3_key_idx" ON "medias"("s3_key");

-- CreateIndex
CREATE INDEX "medias_upload_status_idx" ON "medias"("upload_status");

-- CreateIndex
CREATE INDEX "medias_s3_bucket_idx" ON "medias"("s3_bucket");

-- CreateIndex
CREATE INDEX "medias_visibilite_idx" ON "medias"("visibilite");

-- AddForeignKey
ALTER TABLE "media_variantes" ADD CONSTRAINT "media_variantes_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "medias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "medias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produits" ADD CONSTRAINT "produits_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "medias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projets" ADD CONSTRAINT "projets_logo_id_fkey" FOREIGN KEY ("logo_id") REFERENCES "medias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partenaires" ADD CONSTRAINT "partenaires_logo_id_fkey" FOREIGN KEY ("logo_id") REFERENCES "medias"("id") ON DELETE SET NULL ON UPDATE CASCADE;
