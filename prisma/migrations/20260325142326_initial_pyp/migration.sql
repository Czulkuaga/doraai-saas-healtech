-- CreateEnum
CREATE TYPE "PatientProviderAssignmentType" AS ENUM ('PRIMARY_CARE', 'PREVENTIVE_FOLLOWUP', 'NURSING', 'SPECIALIST_SUPPORT', 'OTHER');

-- CreateTable
CREATE TABLE "PatientProviderAssignment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "providerProfileId" TEXT NOT NULL,
    "assignmentType" "PatientProviderAssignmentType" NOT NULL DEFAULT 'PREVENTIVE_FOLLOWUP',
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientProviderAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PatientProviderAssignment_tenantId_idx" ON "PatientProviderAssignment"("tenantId");

-- CreateIndex
CREATE INDEX "PatientProviderAssignment_tenantId_patientId_idx" ON "PatientProviderAssignment"("tenantId", "patientId");

-- CreateIndex
CREATE INDEX "PatientProviderAssignment_tenantId_providerProfileId_idx" ON "PatientProviderAssignment"("tenantId", "providerProfileId");

-- CreateIndex
CREATE INDEX "PatientProviderAssignment_tenantId_isActive_idx" ON "PatientProviderAssignment"("tenantId", "isActive");

-- CreateIndex
CREATE INDEX "PatientProviderAssignment_tenantId_isPrimary_idx" ON "PatientProviderAssignment"("tenantId", "isPrimary");

-- CreateIndex
CREATE INDEX "PatientProviderAssignment_tenantId_assignmentType_idx" ON "PatientProviderAssignment"("tenantId", "assignmentType");

-- CreateIndex
CREATE INDEX "PatientProviderAssignment_tenantId_patientId_isActive_idx" ON "PatientProviderAssignment"("tenantId", "patientId", "isActive");

-- CreateIndex
CREATE INDEX "PatientProviderAssignment_tenantId_providerProfileId_isActi_idx" ON "PatientProviderAssignment"("tenantId", "providerProfileId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "PatientProviderAssignment_tenantId_patientId_providerProfil_key" ON "PatientProviderAssignment"("tenantId", "patientId", "providerProfileId", "assignmentType");

-- AddForeignKey
ALTER TABLE "PatientProviderAssignment" ADD CONSTRAINT "PatientProviderAssignment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientProviderAssignment" ADD CONSTRAINT "PatientProviderAssignment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "BusinessPartner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientProviderAssignment" ADD CONSTRAINT "PatientProviderAssignment_providerProfileId_fkey" FOREIGN KEY ("providerProfileId") REFERENCES "ProviderProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
