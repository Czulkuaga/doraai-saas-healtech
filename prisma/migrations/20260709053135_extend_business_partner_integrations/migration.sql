-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "AddressType" AS ENUM ('HOME', 'WORK', 'BILLING', 'OTHER');

-- CreateEnum
CREATE TYPE "IdentityDocumentType" AS ENUM ('BELGIAN_EID', 'BELGIAN_KIDS_ID', 'BELGIAN_FOREIGNER_CARD', 'PASSPORT', 'NATIONAL_ID', 'OTHER');

-- CreateEnum
CREATE TYPE "InsuranceVerificationStatus" AS ENUM ('UNKNOWN', 'ACTIVE', 'INACTIVE', 'ERROR');

-- CreateEnum
CREATE TYPE "ExternalSystem" AS ENUM ('SIMPLYBOOK', 'MYCARENET', 'EHEALTH', 'EID_READER', 'OTHER');

-- CreateEnum
CREATE TYPE "IntegrationDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "IntegrationSyncStatus" AS ENUM ('SUCCESS', 'FAILED', 'PARTIAL', 'SKIPPED');

-- AlterTable
ALTER TABLE "BusinessPartner" ADD COLUMN     "deceasedAt" TIMESTAMP(3),
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "localeCode" TEXT,
ADD COLUMN     "nationalityCode" TEXT,
ADD COLUMN     "preferredLanguageCode" TEXT;

-- CreateTable
CREATE TABLE "BusinessPartnerAddress" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "type" "AddressType" NOT NULL DEFAULT 'HOME',
    "isPrimary" BOOLEAN NOT NULL DEFAULT true,
    "street" TEXT,
    "houseNumber" TEXT,
    "box" TEXT,
    "postalCode" TEXT,
    "city" TEXT,
    "region" TEXT,
    "countryCode" TEXT,
    "rawAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessPartnerAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessPartnerIdentity" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "type" "IdentityDocumentType" NOT NULL,
    "nationalNumber" TEXT,
    "nationalNumberNormalized" TEXT,
    "cardNumber" TEXT,
    "cardNumberNormalized" TEXT,
    "issuingCountryCode" TEXT,
    "nationalityCode" TEXT,
    "validFrom" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "source" TEXT,
    "rawData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessPartnerIdentity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientInsuranceCoverage" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "status" "InsuranceVerificationStatus" NOT NULL DEFAULT 'UNKNOWN',
    "insurerCode" TEXT,
    "insurerName" TEXT,
    "mutualityCode" TEXT,
    "mutualityName" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "source" TEXT,
    "externalReference" TEXT,
    "alerts" JSONB,
    "rawResponse" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientInsuranceCoverage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessPartnerExternalRef" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "system" "ExternalSystem" NOT NULL,
    "externalId" TEXT NOT NULL,
    "externalCode" TEXT,
    "lastSyncedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessPartnerExternalRef_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationSyncLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "system" "ExternalSystem" NOT NULL,
    "direction" "IntegrationDirection" NOT NULL,
    "status" "IntegrationSyncStatus" NOT NULL,
    "partnerId" TEXT,
    "operation" TEXT NOT NULL,
    "message" TEXT,
    "requestPayload" JSONB,
    "responsePayload" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "IntegrationSyncLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BusinessPartnerAddress_tenantId_idx" ON "BusinessPartnerAddress"("tenantId");

-- CreateIndex
CREATE INDEX "BusinessPartnerAddress_tenantId_partnerId_idx" ON "BusinessPartnerAddress"("tenantId", "partnerId");

-- CreateIndex
CREATE INDEX "BusinessPartnerAddress_tenantId_postalCode_idx" ON "BusinessPartnerAddress"("tenantId", "postalCode");

-- CreateIndex
CREATE INDEX "BusinessPartnerAddress_tenantId_city_idx" ON "BusinessPartnerAddress"("tenantId", "city");

-- CreateIndex
CREATE INDEX "BusinessPartnerIdentity_tenantId_idx" ON "BusinessPartnerIdentity"("tenantId");

-- CreateIndex
CREATE INDEX "BusinessPartnerIdentity_tenantId_partnerId_idx" ON "BusinessPartnerIdentity"("tenantId", "partnerId");

-- CreateIndex
CREATE INDEX "BusinessPartnerIdentity_tenantId_nationalNumberNormalized_idx" ON "BusinessPartnerIdentity"("tenantId", "nationalNumberNormalized");

-- CreateIndex
CREATE INDEX "BusinessPartnerIdentity_tenantId_cardNumberNormalized_idx" ON "BusinessPartnerIdentity"("tenantId", "cardNumberNormalized");

-- CreateIndex
CREATE INDEX "BusinessPartnerIdentity_tenantId_expiresAt_idx" ON "BusinessPartnerIdentity"("tenantId", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessPartnerIdentity_tenantId_type_nationalNumberNormali_key" ON "BusinessPartnerIdentity"("tenantId", "type", "nationalNumberNormalized");

-- CreateIndex
CREATE INDEX "PatientInsuranceCoverage_tenantId_idx" ON "PatientInsuranceCoverage"("tenantId");

-- CreateIndex
CREATE INDEX "PatientInsuranceCoverage_tenantId_patientId_idx" ON "PatientInsuranceCoverage"("tenantId", "patientId");

-- CreateIndex
CREATE INDEX "PatientInsuranceCoverage_tenantId_status_idx" ON "PatientInsuranceCoverage"("tenantId", "status");

-- CreateIndex
CREATE INDEX "PatientInsuranceCoverage_tenantId_verifiedAt_idx" ON "PatientInsuranceCoverage"("tenantId", "verifiedAt");

-- CreateIndex
CREATE INDEX "PatientInsuranceCoverage_tenantId_insurerCode_idx" ON "PatientInsuranceCoverage"("tenantId", "insurerCode");

-- CreateIndex
CREATE INDEX "BusinessPartnerExternalRef_tenantId_idx" ON "BusinessPartnerExternalRef"("tenantId");

-- CreateIndex
CREATE INDEX "BusinessPartnerExternalRef_tenantId_partnerId_idx" ON "BusinessPartnerExternalRef"("tenantId", "partnerId");

-- CreateIndex
CREATE INDEX "BusinessPartnerExternalRef_tenantId_system_idx" ON "BusinessPartnerExternalRef"("tenantId", "system");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessPartnerExternalRef_tenantId_system_externalId_key" ON "BusinessPartnerExternalRef"("tenantId", "system", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessPartnerExternalRef_tenantId_partnerId_system_key" ON "BusinessPartnerExternalRef"("tenantId", "partnerId", "system");

-- CreateIndex
CREATE INDEX "IntegrationSyncLog_tenantId_idx" ON "IntegrationSyncLog"("tenantId");

-- CreateIndex
CREATE INDEX "IntegrationSyncLog_tenantId_system_idx" ON "IntegrationSyncLog"("tenantId", "system");

-- CreateIndex
CREATE INDEX "IntegrationSyncLog_tenantId_partnerId_idx" ON "IntegrationSyncLog"("tenantId", "partnerId");

-- CreateIndex
CREATE INDEX "IntegrationSyncLog_tenantId_startedAt_idx" ON "IntegrationSyncLog"("tenantId", "startedAt");

-- CreateIndex
CREATE INDEX "IntegrationSyncLog_tenantId_status_idx" ON "IntegrationSyncLog"("tenantId", "status");

-- CreateIndex
CREATE INDEX "BusinessPartner_tenantId_birthDate_idx" ON "BusinessPartner"("tenantId", "birthDate");

-- CreateIndex
CREATE INDEX "BusinessPartner_tenantId_gender_idx" ON "BusinessPartner"("tenantId", "gender");

-- AddForeignKey
ALTER TABLE "BusinessPartnerAddress" ADD CONSTRAINT "BusinessPartnerAddress_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "BusinessPartner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessPartnerAddress" ADD CONSTRAINT "BusinessPartnerAddress_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES "Country"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessPartnerIdentity" ADD CONSTRAINT "BusinessPartnerIdentity_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "BusinessPartner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessPartnerIdentity" ADD CONSTRAINT "BusinessPartnerIdentity_issuingCountryCode_fkey" FOREIGN KEY ("issuingCountryCode") REFERENCES "Country"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessPartnerIdentity" ADD CONSTRAINT "BusinessPartnerIdentity_nationalityCode_fkey" FOREIGN KEY ("nationalityCode") REFERENCES "Country"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientInsuranceCoverage" ADD CONSTRAINT "PatientInsuranceCoverage_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "BusinessPartner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessPartnerExternalRef" ADD CONSTRAINT "BusinessPartnerExternalRef_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "BusinessPartner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationSyncLog" ADD CONSTRAINT "IntegrationSyncLog_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "BusinessPartner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessPartner" ADD CONSTRAINT "BusinessPartner_nationalityCode_fkey" FOREIGN KEY ("nationalityCode") REFERENCES "Country"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessPartner" ADD CONSTRAINT "BusinessPartner_preferredLanguageCode_fkey" FOREIGN KEY ("preferredLanguageCode") REFERENCES "Locale"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
