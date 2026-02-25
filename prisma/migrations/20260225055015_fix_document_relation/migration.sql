-- CreateEnum
CREATE TYPE "StatutCompte" AS ENUM ('EN_ATTENTE', 'ACTIF', 'INACTIF', 'SUSPENDU', 'BLOQUE');

-- CreateEnum
CREATE TYPE "TypeSession" AS ENUM ('COURS_MAGISTRAL', 'TRAVAUX_DIRIGES', 'TRAVAUX_PRATIQUES', 'EXAMEN');

-- CreateEnum
CREATE TYPE "TypeDocument" AS ENUM ('COURS', 'TD', 'TP', 'EXAMEN');

-- CreateEnum
CREATE TYPE "TypeForum" AS ENUM ('GENERAL', 'QUESTIONS_REPONSES', 'COMPTES_RENDUS', 'ANNOUCES');

-- CreateEnum
CREATE TYPE "NiveauEtude" AS ENUM ('L1', 'L2', 'L3', 'M1', 'M2');

-- CreateEnum
CREATE TYPE "Semestre" AS ENUM ('S1', 'S2', 'S3', 'S4', 'S5', 'S6');

-- CreateTable
CREATE TABLE "utilisateurs" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "motDePasse" TEXT NOT NULL,
    "sel" TEXT NOT NULL,
    "nom" VARCHAR(50) NOT NULL,
    "prenom" VARCHAR(50) NOT NULL,
    "dateNaissance" TIMESTAMP(3),
    "telephone" VARCHAR(20),
    "adresse" VARCHAR(255),
    "photoProfil" VARCHAR(500),
    "typeUtilisateur" TEXT NOT NULL,
    "statut" "StatutCompte" NOT NULL DEFAULT 'EN_ATTENTE',
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateDerniereConnexion" TIMESTAMP(3),
    "valideEmail" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "utilisateurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "filieres" (
    "id" SERIAL NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "description" TEXT,
    "niveauAcces" "NiveauEtude" NOT NULL,
    "dureeEtudes" INTEGER NOT NULL,
    "creditsTotal" INTEGER NOT NULL,
    "estActive" BOOLEAN NOT NULL DEFAULT true,
    "capaciteMax" INTEGER,
    "effectifActuel" INTEGER NOT NULL DEFAULT 0,
    "responsableId" INTEGER,

    CONSTRAINT "filieres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salles" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "nom" VARCHAR(50) NOT NULL,
    "batiment" VARCHAR(50) NOT NULL,
    "capacite" INTEGER NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "equipements" TEXT,
    "estActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "salles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enseignants" (
    "id" SERIAL NOT NULL,
    "utilisateurId" INTEGER NOT NULL,
    "matricule" VARCHAR(20) NOT NULL,
    "grade" VARCHAR(50) NOT NULL,
    "specialite" VARCHAR(100) NOT NULL,
    "dateRecrutement" TIMESTAMP(3),
    "bureau" VARCHAR(20),
    "telephoneInterne" VARCHAR(10),
    "heuresServiceAnnuel" INTEGER,
    "heuresEffectuees" INTEGER,
    "estResponsableFiliere" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "enseignants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "administrateurs" (
    "id" SERIAL NOT NULL,
    "utilisateurId" INTEGER NOT NULL,
    "matricule" VARCHAR(20) NOT NULL,
    "service" VARCHAR(100) NOT NULL,
    "role" VARCHAR(50) NOT NULL,
    "permissions" TEXT,
    "niveauAcces" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "administrateurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "etudiants" (
    "id" SERIAL NOT NULL,
    "utilisateurId" INTEGER NOT NULL,
    "numeroEtudiant" VARCHAR(20) NOT NULL,
    "numeroINE" VARCHAR(11) NOT NULL,
    "anneeAcademique" VARCHAR(9) NOT NULL,
    "niveau" "NiveauEtude" NOT NULL,
    "semestreActuel" "Semestre" NOT NULL,
    "groupe" VARCHAR(10),
    "sousGroupe" VARCHAR(10),
    "moyenneGenerale" DECIMAL(65,30),
    "creditsAcquis" INTEGER NOT NULL DEFAULT 0,
    "tauxAbsence" DECIMAL(5,2),
    "filiereId" INTEGER NOT NULL,

    CONSTRAINT "etudiants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specialites" (
    "id" SERIAL NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "description" TEXT,
    "estActive" BOOLEAN NOT NULL DEFAULT true,
    "filiereId" INTEGER NOT NULL,
    "responsableId" INTEGER,

    CONSTRAINT "specialites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotions" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "anneeUniversitaire" VARCHAR(9) NOT NULL,
    "niveau" "NiveauEtude" NOT NULL,
    "groupes" TEXT,
    "effectifReel" INTEGER NOT NULL DEFAULT 0,
    "estActive" BOOLEAN NOT NULL DEFAULT true,
    "specialiteId" INTEGER NOT NULL,
    "responsableId" INTEGER,

    CONSTRAINT "promotions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programmes" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "nom" VARCHAR(200) NOT NULL,
    "semestre" "Semestre" NOT NULL,
    "volumeHoraireTotal" INTEGER NOT NULL,
    "creditsSemestre" INTEGER NOT NULL,
    "estValide" BOOLEAN NOT NULL DEFAULT false,
    "promotionId" INTEGER NOT NULL,

    CONSTRAINT "programmes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emplois_temps" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "groupe" VARCHAR(10),
    "semaine" INTEGER NOT NULL,
    "anneeUniversitaire" VARCHAR(9) NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3) NOT NULL,
    "datePublication" TIMESTAMP(3),
    "fichierPDF" VARCHAR(500),
    "promotionId" INTEGER NOT NULL,

    CONSTRAINT "emplois_temps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "type" "TypeSession" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "heureDebut" VARCHAR(5) NOT NULL,
    "heureFin" VARCHAR(5) NOT NULL,
    "groupe" VARCHAR(10),
    "estAnnulee" BOOLEAN NOT NULL DEFAULT false,
    "emploiTempsId" INTEGER NOT NULL,
    "moduleId" INTEGER NOT NULL,
    "coursId" INTEGER,
    "enseignantId" INTEGER NOT NULL,
    "salleId" INTEGER NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inscriptions" (
    "id" SERIAL NOT NULL,
    "numeroInscription" VARCHAR(30) NOT NULL,
    "dateInscription" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateValidation" TIMESTAMP(3),
    "statut" VARCHAR(20) NOT NULL,
    "quitusFinancier" BOOLEAN NOT NULL DEFAULT false,
    "montantFrais" DECIMAL(10,2),
    "statutPaiement" VARCHAR(20),
    "etudiantId" INTEGER NOT NULL,
    "promotionId" INTEGER NOT NULL,
    "validePar" INTEGER,
    "coursId" INTEGER,

    CONSTRAINT "inscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cours" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "nom" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "volumeHoraireCM" INTEGER NOT NULL DEFAULT 0,
    "volumeHoraireTD" INTEGER NOT NULL DEFAULT 0,
    "volumeHoraireTP" INTEGER NOT NULL DEFAULT 0,
    "credits" INTEGER NOT NULL,
    "coefficient" DECIMAL(4,2) NOT NULL,
    "estOptionnel" BOOLEAN NOT NULL DEFAULT false,
    "programmeId" INTEGER NOT NULL,
    "enseignantPrincipalId" INTEGER NOT NULL,

    CONSTRAINT "cours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modules" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "nom" VARCHAR(200) NOT NULL,
    "type" TEXT,
    "groupeCible" VARCHAR(10),
    "volumeHoraire" INTEGER NOT NULL,
    "coefficient" DECIMAL(4,2) NOT NULL,
    "sallePreferee" VARCHAR(50),
    "coursId" INTEGER NOT NULL,
    "enseignantPrincipalId" INTEGER,

    CONSTRAINT "modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "presences" (
    "id" SERIAL NOT NULL,
    "estPresent" BOOLEAN NOT NULL DEFAULT false,
    "heureArrivee" VARCHAR(5),
    "justification" VARCHAR(200),
    "justifiee" BOOLEAN NOT NULL DEFAULT false,
    "dateMarquage" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" INTEGER NOT NULL,
    "etudiantId" INTEGER NOT NULL,
    "marquePar" INTEGER,

    CONSTRAINT "presences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "examens" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "titre" VARCHAR(200) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "heureDebut" VARCHAR(5) NOT NULL,
    "duree" INTEGER NOT NULL,
    "coefficient" DECIMAL(4,2) NOT NULL,
    "bareme" DECIMAL(5,2) NOT NULL,
    "surveillantIds" TEXT,
    "statut" VARCHAR(20) NOT NULL,
    "moduleId" INTEGER NOT NULL,
    "enseignantId" INTEGER,

    CONSTRAINT "examens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notes" (
    "id" SERIAL NOT NULL,
    "valeur" DECIMAL(5,2) NOT NULL,
    "valeurSur20" DECIMAL(5,2) NOT NULL,
    "mention" VARCHAR(20),
    "dateSaisie" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateValidation" TIMESTAMP(3),
    "examenId" INTEGER NOT NULL,
    "etudiantId" INTEGER NOT NULL,
    "saisiePar" INTEGER,
    "validePar" INTEGER,

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" SERIAL NOT NULL,
    "titre" VARCHAR(200) NOT NULL,
    "type" "TypeDocument" NOT NULL,
    "format" VARCHAR(10) NOT NULL,
    "taille" INTEGER NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "dateDepot" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nbTelechargements" INTEGER NOT NULL DEFAULT 0,
    "coursId" INTEGER,
    "moduleId" INTEGER,
    "enseignantId" INTEGER,
    "etudiantId" INTEGER,
    "deposePar" INTEGER,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forums" (
    "id" SERIAL NOT NULL,
    "titre" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "type" "TypeForum" NOT NULL,
    "estPrive" BOOLEAN NOT NULL DEFAULT true,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nbMessages" INTEGER NOT NULL DEFAULT 0,
    "coursId" INTEGER NOT NULL,
    "createdBy" INTEGER NOT NULL,

    CONSTRAINT "forums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" SERIAL NOT NULL,
    "contenu" TEXT NOT NULL,
    "datePublication" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nbLikes" INTEGER NOT NULL DEFAULT 0,
    "forumId" INTEGER NOT NULL,
    "auteurId" INTEGER NOT NULL,
    "parentId" INTEGER,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_email_key" ON "utilisateurs"("email");

-- CreateIndex
CREATE UNIQUE INDEX "filieres_code_key" ON "filieres"("code");

-- CreateIndex
CREATE UNIQUE INDEX "filieres_responsableId_key" ON "filieres"("responsableId");

-- CreateIndex
CREATE UNIQUE INDEX "salles_code_key" ON "salles"("code");

-- CreateIndex
CREATE UNIQUE INDEX "enseignants_utilisateurId_key" ON "enseignants"("utilisateurId");

-- CreateIndex
CREATE UNIQUE INDEX "enseignants_matricule_key" ON "enseignants"("matricule");

-- CreateIndex
CREATE UNIQUE INDEX "administrateurs_utilisateurId_key" ON "administrateurs"("utilisateurId");

-- CreateIndex
CREATE UNIQUE INDEX "administrateurs_matricule_key" ON "administrateurs"("matricule");

-- CreateIndex
CREATE UNIQUE INDEX "etudiants_utilisateurId_key" ON "etudiants"("utilisateurId");

-- CreateIndex
CREATE UNIQUE INDEX "etudiants_numeroEtudiant_key" ON "etudiants"("numeroEtudiant");

-- CreateIndex
CREATE UNIQUE INDEX "etudiants_numeroINE_key" ON "etudiants"("numeroINE");

-- CreateIndex
CREATE UNIQUE INDEX "specialites_code_key" ON "specialites"("code");

-- CreateIndex
CREATE UNIQUE INDEX "promotions_code_key" ON "promotions"("code");

-- CreateIndex
CREATE UNIQUE INDEX "programmes_code_key" ON "programmes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "emplois_temps_code_key" ON "emplois_temps"("code");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_code_key" ON "sessions"("code");

-- CreateIndex
CREATE UNIQUE INDEX "inscriptions_numeroInscription_key" ON "inscriptions"("numeroInscription");

-- CreateIndex
CREATE UNIQUE INDEX "inscriptions_etudiantId_promotionId_key" ON "inscriptions"("etudiantId", "promotionId");

-- CreateIndex
CREATE UNIQUE INDEX "cours_code_key" ON "cours"("code");

-- CreateIndex
CREATE UNIQUE INDEX "modules_code_key" ON "modules"("code");

-- CreateIndex
CREATE UNIQUE INDEX "presences_sessionId_etudiantId_key" ON "presences"("sessionId", "etudiantId");

-- CreateIndex
CREATE UNIQUE INDEX "examens_code_key" ON "examens"("code");

-- AddForeignKey
ALTER TABLE "filieres" ADD CONSTRAINT "filieres_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "enseignants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enseignants" ADD CONSTRAINT "enseignants_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "administrateurs" ADD CONSTRAINT "administrateurs_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etudiants" ADD CONSTRAINT "etudiants_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etudiants" ADD CONSTRAINT "etudiants_filiereId_fkey" FOREIGN KEY ("filiereId") REFERENCES "filieres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specialites" ADD CONSTRAINT "specialites_filiereId_fkey" FOREIGN KEY ("filiereId") REFERENCES "filieres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specialites" ADD CONSTRAINT "specialites_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "enseignants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotions" ADD CONSTRAINT "promotions_specialiteId_fkey" FOREIGN KEY ("specialiteId") REFERENCES "specialites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotions" ADD CONSTRAINT "promotions_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "enseignants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programmes" ADD CONSTRAINT "programmes_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "promotions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emplois_temps" ADD CONSTRAINT "emplois_temps_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "promotions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_emploiTempsId_fkey" FOREIGN KEY ("emploiTempsId") REFERENCES "emplois_temps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_coursId_fkey" FOREIGN KEY ("coursId") REFERENCES "cours"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_enseignantId_fkey" FOREIGN KEY ("enseignantId") REFERENCES "enseignants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_salleId_fkey" FOREIGN KEY ("salleId") REFERENCES "salles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscriptions" ADD CONSTRAINT "inscriptions_etudiantId_fkey" FOREIGN KEY ("etudiantId") REFERENCES "etudiants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscriptions" ADD CONSTRAINT "inscriptions_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "promotions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscriptions" ADD CONSTRAINT "inscriptions_coursId_fkey" FOREIGN KEY ("coursId") REFERENCES "cours"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cours" ADD CONSTRAINT "cours_programmeId_fkey" FOREIGN KEY ("programmeId") REFERENCES "programmes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cours" ADD CONSTRAINT "cours_enseignantPrincipalId_fkey" FOREIGN KEY ("enseignantPrincipalId") REFERENCES "enseignants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modules" ADD CONSTRAINT "modules_coursId_fkey" FOREIGN KEY ("coursId") REFERENCES "cours"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modules" ADD CONSTRAINT "modules_enseignantPrincipalId_fkey" FOREIGN KEY ("enseignantPrincipalId") REFERENCES "enseignants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presences" ADD CONSTRAINT "presences_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presences" ADD CONSTRAINT "presences_etudiantId_fkey" FOREIGN KEY ("etudiantId") REFERENCES "etudiants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presences" ADD CONSTRAINT "presences_marquePar_fkey" FOREIGN KEY ("marquePar") REFERENCES "enseignants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "examens" ADD CONSTRAINT "examens_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "examens" ADD CONSTRAINT "examens_enseignantId_fkey" FOREIGN KEY ("enseignantId") REFERENCES "enseignants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_examenId_fkey" FOREIGN KEY ("examenId") REFERENCES "examens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_etudiantId_fkey" FOREIGN KEY ("etudiantId") REFERENCES "etudiants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_coursId_fkey" FOREIGN KEY ("coursId") REFERENCES "cours"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_enseignantId_fkey" FOREIGN KEY ("enseignantId") REFERENCES "enseignants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_etudiantId_fkey" FOREIGN KEY ("etudiantId") REFERENCES "etudiants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forums" ADD CONSTRAINT "forums_coursId_fkey" FOREIGN KEY ("coursId") REFERENCES "cours"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forums" ADD CONSTRAINT "forums_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "enseignants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_forumId_fkey" FOREIGN KEY ("forumId") REFERENCES "forums"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_auteurId_fkey" FOREIGN KEY ("auteurId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
