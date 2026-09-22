-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'EDITEUR', 'MODERATEUR', 'LECTEUR');

-- CreateEnum
CREATE TYPE "StatutLead" AS ENUM ('NOUVEAU', 'EN_COURS', 'TRAITE', 'ARCHIVE');

-- CreateEnum
CREATE TYPE "StatutProduit" AS ENUM ('NOUVEAU', 'ACTIF', 'ARCHIVE');

-- CreateEnum
CREATE TYPE "TypeEvenement" AS ENUM ('PAGEVIEW', 'CLICK', 'DOWNLOAD', 'FORM_SUBMIT');

-- CreateTable
CREATE TABLE "utilisateurs" (
    "id" UUID NOT NULL,
    "nom_complet" VARCHAR(200) NOT NULL,
    "email" VARCHAR(200) NOT NULL,
    "mot_de_passe" VARCHAR(255) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'LECTEUR',
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "tentatives_echec" INTEGER NOT NULL DEFAULT 0,
    "bloque_jusqua" TIMESTAMP(3),
    "refresh_token" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "utilisateurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" BIGSERIAL NOT NULL,
    "utilisateur_id" UUID NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "entite_cible" VARCHAR(100) NOT NULL,
    "entite_id" VARCHAR(100),
    "detail" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" UUID NOT NULL,
    "modifie_par" UUID,
    "titre" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "icone" VARCHAR(100),
    "image_url" VARCHAR(500),
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produits" (
    "id" UUID NOT NULL,
    "modifie_par" UUID,
    "nom" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "categorie" VARCHAR(100) NOT NULL,
    "statut" "StatutProduit" NOT NULL DEFAULT 'ACTIF',
    "features" JSONB,
    "image_url" VARCHAR(500),
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "produits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projets" (
    "id" UUID NOT NULL,
    "modifie_par" UUID,
    "titre" VARCHAR(300) NOT NULL,
    "client" VARCHAR(200) NOT NULL,
    "secteur" VARCHAR(150) NOT NULL,
    "description" TEXT NOT NULL,
    "technologies" JSONB,
    "logo_client_url" VARCHAR(500),
    "date_realisation" DATE,
    "publie" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" UUID NOT NULL,
    "traite_par" UUID,
    "nom_complet" VARCHAR(200) NOT NULL,
    "email" VARCHAR(200) NOT NULL,
    "organisation" VARCHAR(200),
    "sujet" VARCHAR(200) NOT NULL,
    "message" TEXT NOT NULL,
    "statut" "StatutLead" NOT NULL DEFAULT 'NOUVEAU',
    "notes_internes" TEXT,
    "ip_adresse" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partenaires" (
    "id" UUID NOT NULL,
    "modifie_par" UUID,
    "nom" VARCHAR(200) NOT NULL,
    "logo_url" VARCHAR(500),
    "site_web" VARCHAR(300),
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partenaires_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medias" (
    "id" UUID NOT NULL,
    "uploade_par" UUID,
    "nom_fichier" VARCHAR(300) NOT NULL,
    "type_mime" VARCHAR(100) NOT NULL,
    "taille_octets" BIGINT NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "alt_text" VARCHAR(300),
    "dossier" VARCHAR(200),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evenements_analytics" (
    "id" BIGSERIAL NOT NULL,
    "session_id" UUID NOT NULL,
    "page_path" VARCHAR(500) NOT NULL,
    "evenement" "TypeEvenement" NOT NULL,
    "user_agent" TEXT,
    "pays" VARCHAR(100),
    "duree_secondes" INTEGER,
    "referrer" VARCHAR(500),
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evenements_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_email_key" ON "utilisateurs"("email");

-- CreateIndex
CREATE INDEX "audit_logs_utilisateur_id_idx" ON "audit_logs"("utilisateur_id");

-- CreateIndex
CREATE INDEX "audit_logs_entite_cible_entite_id_idx" ON "audit_logs"("entite_cible", "entite_id");

-- CreateIndex
CREATE UNIQUE INDEX "services_slug_key" ON "services"("slug");

-- CreateIndex
CREATE INDEX "services_slug_idx" ON "services"("slug");

-- CreateIndex
CREATE INDEX "services_actif_idx" ON "services"("actif");

-- CreateIndex
CREATE UNIQUE INDEX "produits_slug_key" ON "produits"("slug");

-- CreateIndex
CREATE INDEX "produits_slug_idx" ON "produits"("slug");

-- CreateIndex
CREATE INDEX "produits_categorie_idx" ON "produits"("categorie");

-- CreateIndex
CREATE INDEX "produits_statut_idx" ON "produits"("statut");

-- CreateIndex
CREATE INDEX "projets_secteur_idx" ON "projets"("secteur");

-- CreateIndex
CREATE INDEX "projets_publie_idx" ON "projets"("publie");

-- CreateIndex
CREATE INDEX "leads_statut_idx" ON "leads"("statut");

-- CreateIndex
CREATE INDEX "leads_created_at_idx" ON "leads"("created_at");

-- CreateIndex
CREATE INDEX "partenaires_actif_idx" ON "partenaires"("actif");

-- CreateIndex
CREATE INDEX "medias_type_mime_idx" ON "medias"("type_mime");

-- CreateIndex
CREATE INDEX "medias_dossier_idx" ON "medias"("dossier");

-- CreateIndex
CREATE INDEX "evenements_analytics_session_id_idx" ON "evenements_analytics"("session_id");

-- CreateIndex
CREATE INDEX "evenements_analytics_page_path_idx" ON "evenements_analytics"("page_path");

-- CreateIndex
CREATE INDEX "evenements_analytics_evenement_idx" ON "evenements_analytics"("evenement");

-- CreateIndex
CREATE INDEX "evenements_analytics_timestamp_idx" ON "evenements_analytics"("timestamp");

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_modifie_par_fkey" FOREIGN KEY ("modifie_par") REFERENCES "utilisateurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produits" ADD CONSTRAINT "produits_modifie_par_fkey" FOREIGN KEY ("modifie_par") REFERENCES "utilisateurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projets" ADD CONSTRAINT "projets_modifie_par_fkey" FOREIGN KEY ("modifie_par") REFERENCES "utilisateurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_traite_par_fkey" FOREIGN KEY ("traite_par") REFERENCES "utilisateurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partenaires" ADD CONSTRAINT "partenaires_modifie_par_fkey" FOREIGN KEY ("modifie_par") REFERENCES "utilisateurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medias" ADD CONSTRAINT "medias_uploade_par_fkey" FOREIGN KEY ("uploade_par") REFERENCES "utilisateurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
