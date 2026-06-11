-- CreateEnum
CREATE TYPE "PreventiveRiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "Pathology" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pathology_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientPathology" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "pathologyId" TEXT NOT NULL,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "diagnosedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientPathology_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Pathology_tenantId_idx" ON "Pathology"("tenantId");

-- CreateIndex
CREATE INDEX "Pathology_tenantId_isActive_idx" ON "Pathology"("tenantId", "isActive");

-- CreateIndex
CREATE INDEX "Pathology_tenantId_name_idx" ON "Pathology"("tenantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Pathology_tenantId_code_key" ON "Pathology"("tenantId", "code");

-- CreateIndex
CREATE INDEX "PatientPathology_tenantId_idx" ON "PatientPathology"("tenantId");

-- CreateIndex
CREATE INDEX "PatientPathology_tenantId_patientId_idx" ON "PatientPathology"("tenantId", "patientId");

-- CreateIndex
CREATE INDEX "PatientPathology_tenantId_pathologyId_idx" ON "PatientPathology"("tenantId", "pathologyId");

-- CreateIndex
CREATE INDEX "PatientPathology_tenantId_patientId_isActive_idx" ON "PatientPathology"("tenantId", "patientId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "PatientPathology_tenantId_patientId_pathologyId_key" ON "PatientPathology"("tenantId", "patientId", "pathologyId");

-- AddForeignKey
ALTER TABLE "Pathology" ADD CONSTRAINT "Pathology_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientPathology" ADD CONSTRAINT "PatientPathology_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientPathology" ADD CONSTRAINT "PatientPathology_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "BusinessPartner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientPathology" ADD CONSTRAINT "PatientPathology_pathologyId_fkey" FOREIGN KEY ("pathologyId") REFERENCES "Pathology"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
