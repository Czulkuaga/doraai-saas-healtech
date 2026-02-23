/*
  Warnings:

  - You are about to drop the column `actorUserId` on the `AuditLog` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `Tenant` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[emailNormalized]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Made the column `actorMembershipId` on table `AuditLog` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `code` to the `Tenant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `defaultCurrencyCode` to the `Tenant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `defaultLocaleCode` to the `Tenant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `defaultTimeZoneId` to the `Tenant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `emailNormalized` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PartnerType" AS ENUM ('PERSON', 'ORGANIZATION');

-- CreateEnum
CREATE TYPE "BPRoleType" AS ENUM ('PATIENT', 'PROVIDER', 'STAFF', 'INSURER', 'CONTACT', 'SUPPLIER');

-- CreateEnum
CREATE TYPE "NumberRangeObject" AS ENUM ('BUSINESS_PARTNER', 'ORG_UNIT', 'LOCATION', 'APPOINTMENT', 'PREVENTIVE_CASE');

-- CreateEnum
CREATE TYPE "TranslatableEntity" AS ENUM ('SPECIALTY', 'SERVICE_TYPE', 'ORG_UNIT', 'LOCATION');

-- CreateEnum
CREATE TYPE "TranslatableField" AS ENUM ('NAME', 'DESCRIPTION');

-- CreateEnum
CREATE TYPE "PreventiveTemplateStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PreventiveCaseStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PreventiveFieldType" AS ENUM ('TEXT', 'TEXTAREA', 'NUMBER', 'BOOLEAN', 'DATE', 'DATETIME', 'SINGLE_SELECT', 'MULTI_SELECT', 'FILE', 'JSON');

-- CreateEnum
CREATE TYPE "PreventiveValueKind" AS ENUM ('STRING', 'NUMBER', 'BOOLEAN', 'DATE', 'DATETIME', 'OPTION', 'OPTION_LIST', 'JSON');

-- AlterEnum
ALTER TYPE "AuthEventType" ADD VALUE 'SESSION_IDLE_TIMEOUT';

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_actorMembershipId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_actorUserId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "AuthEvent" DROP CONSTRAINT "AuthEvent_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "MembershipRole" DROP CONSTRAINT "MembershipRole_membershipId_fkey";

-- DropForeignKey
ALTER TABLE "MembershipRole" DROP CONSTRAINT "MembershipRole_roleId_fkey";

-- DropForeignKey
ALTER TABLE "Role" DROP CONSTRAINT "Role_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "RolePermission" DROP CONSTRAINT "RolePermission_permissionId_fkey";

-- DropForeignKey
ALTER TABLE "RolePermission" DROP CONSTRAINT "RolePermission_roleId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "TenantMembership" DROP CONSTRAINT "TenantMembership_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "TenantMembership" DROP CONSTRAINT "TenantMembership_userId_fkey";

-- DropIndex
DROP INDEX "AuditLog_actorUserId_idx";

-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "AuditLog" DROP COLUMN "actorUserId",
ALTER COLUMN "actorMembershipId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "countryCode" TEXT,
ADD COLUMN     "defaultCurrencyCode" TEXT NOT NULL,
ADD COLUMN     "defaultLocaleCode" TEXT NOT NULL,
ADD COLUMN     "defaultTimeZoneId" TEXT NOT NULL,
ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailNormalized" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "OrgUnit" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrgUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "addressLine1" TEXT,
    "city" TEXT,
    "postalCode" TEXT,
    "countryCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantLocale" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "localeCode" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TenantLocale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessPartnerRole" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "role" "BPRoleType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BusinessPartnerRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Translation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "entity" "TranslatableEntity" NOT NULL,
    "entityId" TEXT NOT NULL,
    "field" "TranslatableField" NOT NULL,
    "localeCode" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "Translation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderProfile" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "licenseNumber" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderSpecialty" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "specialtyId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ProviderSpecialty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NumberRange" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "object" "NumberRangeObject" NOT NULL,
    "prefix" TEXT,
    "nextNo" INTEGER NOT NULL,
    "padding" INTEGER NOT NULL DEFAULT 8,

    CONSTRAINT "NumberRange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreventiveTemplate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "PreventiveTemplateStatus" NOT NULL DEFAULT 'DRAFT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "serviceTypeId" TEXT,
    "specialtyId" TEXT,
    "publishedVersionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PreventiveTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreventiveTemplateSection" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PreventiveTemplateSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreventiveTemplateVersion" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "status" "PreventiveTemplateStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "rules" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PreventiveTemplateVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreventiveTemplateField" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "sectionId" TEXT,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" "PreventiveFieldType" NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PreventiveTemplateField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreventiveFieldOption" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PreventiveFieldOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreventiveCase" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" "PreventiveCaseStatus" NOT NULL DEFAULT 'OPEN',
    "patientId" TEXT NOT NULL,
    "providerProfileId" TEXT,
    "orgUnitId" TEXT,
    "locationId" TEXT,
    "templateVersionId" TEXT NOT NULL,
    "serviceTypeId" TEXT,
    "specialtyId" TEXT,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PreventiveCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreventiveCaseValue" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "kind" "PreventiveValueKind" NOT NULL,
    "valueString" TEXT,
    "valueNumber" DECIMAL(65,30),
    "valueBoolean" BOOLEAN,
    "valueDate" TIMESTAMP(3),
    "valueDateTime" TIMESTAMP(3),
    "valueJson" JSONB,
    "optionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PreventiveCaseValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreventiveCaseValueOption" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "valueId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PreventiveCaseValueOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessPartner" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "PartnerType" NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "organizationName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "birthDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessPartner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceType" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerIdentifier" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "countryCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartnerIdentifier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Locale" (
    "code" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "region" TEXT,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Locale_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "TimeZone" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TimeZone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Currency" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT,
    "decimals" INTEGER NOT NULL DEFAULT 2,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "Country" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "euMember" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "currencyCode" TEXT NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "Specialty" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Specialty_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrgUnit_tenantId_idx" ON "OrgUnit"("tenantId");

-- CreateIndex
CREATE INDEX "OrgUnit_tenantId_parentCode_idx" ON "OrgUnit"("tenantId", "parentCode");

-- CreateIndex
CREATE UNIQUE INDEX "OrgUnit_tenantId_code_key" ON "OrgUnit"("tenantId", "code");

-- CreateIndex
CREATE INDEX "Location_tenantId_idx" ON "Location"("tenantId");

-- CreateIndex
CREATE INDEX "Location_countryCode_idx" ON "Location"("countryCode");

-- CreateIndex
CREATE UNIQUE INDEX "Location_tenantId_code_key" ON "Location"("tenantId", "code");

-- CreateIndex
CREATE INDEX "TenantLocale_tenantId_idx" ON "TenantLocale"("tenantId");

-- CreateIndex
CREATE INDEX "TenantLocale_localeCode_idx" ON "TenantLocale"("localeCode");

-- CreateIndex
CREATE UNIQUE INDEX "TenantLocale_tenantId_localeCode_key" ON "TenantLocale"("tenantId", "localeCode");

-- CreateIndex
CREATE INDEX "BusinessPartnerRole_tenantId_role_idx" ON "BusinessPartnerRole"("tenantId", "role");

-- CreateIndex
CREATE INDEX "BusinessPartnerRole_tenantId_partnerId_idx" ON "BusinessPartnerRole"("tenantId", "partnerId");

-- CreateIndex
CREATE INDEX "BusinessPartnerRole_role_idx" ON "BusinessPartnerRole"("role");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessPartnerRole_tenantId_partnerId_role_key" ON "BusinessPartnerRole"("tenantId", "partnerId", "role");

-- CreateIndex
CREATE INDEX "Translation_entity_entityId_idx" ON "Translation"("entity", "entityId");

-- CreateIndex
CREATE INDEX "Translation_localeCode_idx" ON "Translation"("localeCode");

-- CreateIndex
CREATE UNIQUE INDEX "Translation_tenantId_entity_entityId_field_localeCode_key" ON "Translation"("tenantId", "entity", "entityId", "field", "localeCode");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderProfile_partnerId_key" ON "ProviderProfile"("partnerId");

-- CreateIndex
CREATE INDEX "ProviderSpecialty_specialtyId_idx" ON "ProviderSpecialty"("specialtyId");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderSpecialty_providerId_specialtyId_key" ON "ProviderSpecialty"("providerId", "specialtyId");

-- CreateIndex
CREATE INDEX "NumberRange_tenantId_idx" ON "NumberRange"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "NumberRange_tenantId_object_key" ON "NumberRange"("tenantId", "object");

-- CreateIndex
CREATE UNIQUE INDEX "PreventiveTemplate_publishedVersionId_key" ON "PreventiveTemplate"("publishedVersionId");

-- CreateIndex
CREATE INDEX "PreventiveTemplate_tenantId_idx" ON "PreventiveTemplate"("tenantId");

-- CreateIndex
CREATE INDEX "PreventiveTemplate_tenantId_status_idx" ON "PreventiveTemplate"("tenantId", "status");

-- CreateIndex
CREATE INDEX "PreventiveTemplate_tenantId_isActive_idx" ON "PreventiveTemplate"("tenantId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "PreventiveTemplate_tenantId_code_key" ON "PreventiveTemplate"("tenantId", "code");

-- CreateIndex
CREATE INDEX "PreventiveTemplateSection_tenantId_idx" ON "PreventiveTemplateSection"("tenantId");

-- CreateIndex
CREATE INDEX "PreventiveTemplateSection_versionId_order_idx" ON "PreventiveTemplateSection"("versionId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "PreventiveTemplateSection_versionId_key_key" ON "PreventiveTemplateSection"("versionId", "key");

-- CreateIndex
CREATE INDEX "PreventiveTemplateVersion_tenantId_idx" ON "PreventiveTemplateVersion"("tenantId");

-- CreateIndex
CREATE INDEX "PreventiveTemplateVersion_templateId_idx" ON "PreventiveTemplateVersion"("templateId");

-- CreateIndex
CREATE INDEX "PreventiveTemplateVersion_status_idx" ON "PreventiveTemplateVersion"("status");

-- CreateIndex
CREATE INDEX "PreventiveTemplateVersion_tenantId_templateId_idx" ON "PreventiveTemplateVersion"("tenantId", "templateId");

-- CreateIndex
CREATE UNIQUE INDEX "PreventiveTemplateVersion_templateId_version_key" ON "PreventiveTemplateVersion"("templateId", "version");

-- CreateIndex
CREATE INDEX "PreventiveTemplateField_tenantId_idx" ON "PreventiveTemplateField"("tenantId");

-- CreateIndex
CREATE INDEX "PreventiveTemplateField_versionId_order_idx" ON "PreventiveTemplateField"("versionId", "order");

-- CreateIndex
CREATE INDEX "PreventiveTemplateField_sectionId_order_idx" ON "PreventiveTemplateField"("sectionId", "order");

-- CreateIndex
CREATE INDEX "PreventiveTemplateField_versionId_sectionId_order_idx" ON "PreventiveTemplateField"("versionId", "sectionId", "order");

-- CreateIndex
CREATE INDEX "PreventiveTemplateField_type_idx" ON "PreventiveTemplateField"("type");

-- CreateIndex
CREATE UNIQUE INDEX "PreventiveTemplateField_versionId_key_key" ON "PreventiveTemplateField"("versionId", "key");

-- CreateIndex
CREATE INDEX "PreventiveFieldOption_tenantId_idx" ON "PreventiveFieldOption"("tenantId");

-- CreateIndex
CREATE INDEX "PreventiveFieldOption_fieldId_order_idx" ON "PreventiveFieldOption"("fieldId", "order");

-- CreateIndex
CREATE INDEX "PreventiveFieldOption_versionId_idx" ON "PreventiveFieldOption"("versionId");

-- CreateIndex
CREATE UNIQUE INDEX "PreventiveFieldOption_fieldId_key_key" ON "PreventiveFieldOption"("fieldId", "key");

-- CreateIndex
CREATE INDEX "PreventiveCase_tenantId_idx" ON "PreventiveCase"("tenantId");

-- CreateIndex
CREATE INDEX "PreventiveCase_tenantId_status_idx" ON "PreventiveCase"("tenantId", "status");

-- CreateIndex
CREATE INDEX "PreventiveCase_tenantId_patientId_idx" ON "PreventiveCase"("tenantId", "patientId");

-- CreateIndex
CREATE INDEX "PreventiveCase_tenantId_patientId_status_idx" ON "PreventiveCase"("tenantId", "patientId", "status");

-- CreateIndex
CREATE INDEX "PreventiveCase_tenantId_templateVersionId_idx" ON "PreventiveCase"("tenantId", "templateVersionId");

-- CreateIndex
CREATE INDEX "PreventiveCase_tenantId_providerProfileId_idx" ON "PreventiveCase"("tenantId", "providerProfileId");

-- CreateIndex
CREATE INDEX "PreventiveCase_tenantId_orgUnitId_idx" ON "PreventiveCase"("tenantId", "orgUnitId");

-- CreateIndex
CREATE INDEX "PreventiveCase_tenantId_locationId_idx" ON "PreventiveCase"("tenantId", "locationId");

-- CreateIndex
CREATE UNIQUE INDEX "PreventiveCase_tenantId_code_key" ON "PreventiveCase"("tenantId", "code");

-- CreateIndex
CREATE INDEX "PreventiveCaseValue_tenantId_idx" ON "PreventiveCaseValue"("tenantId");

-- CreateIndex
CREATE INDEX "PreventiveCaseValue_caseId_idx" ON "PreventiveCaseValue"("caseId");

-- CreateIndex
CREATE INDEX "PreventiveCaseValue_fieldId_idx" ON "PreventiveCaseValue"("fieldId");

-- CreateIndex
CREATE INDEX "PreventiveCaseValue_kind_idx" ON "PreventiveCaseValue"("kind");

-- CreateIndex
CREATE INDEX "PreventiveCaseValue_optionId_idx" ON "PreventiveCaseValue"("optionId");

-- CreateIndex
CREATE INDEX "PreventiveCaseValue_tenantId_caseId_idx" ON "PreventiveCaseValue"("tenantId", "caseId");

-- CreateIndex
CREATE INDEX "PreventiveCaseValue_tenantId_fieldId_idx" ON "PreventiveCaseValue"("tenantId", "fieldId");

-- CreateIndex
CREATE UNIQUE INDEX "PreventiveCaseValue_caseId_fieldId_key" ON "PreventiveCaseValue"("caseId", "fieldId");

-- CreateIndex
CREATE INDEX "PreventiveCaseValueOption_tenantId_idx" ON "PreventiveCaseValueOption"("tenantId");

-- CreateIndex
CREATE INDEX "PreventiveCaseValueOption_valueId_idx" ON "PreventiveCaseValueOption"("valueId");

-- CreateIndex
CREATE INDEX "PreventiveCaseValueOption_optionId_idx" ON "PreventiveCaseValueOption"("optionId");

-- CreateIndex
CREATE INDEX "PreventiveCaseValueOption_tenantId_valueId_idx" ON "PreventiveCaseValueOption"("tenantId", "valueId");

-- CreateIndex
CREATE INDEX "PreventiveCaseValueOption_tenantId_optionId_idx" ON "PreventiveCaseValueOption"("tenantId", "optionId");

-- CreateIndex
CREATE UNIQUE INDEX "PreventiveCaseValueOption_valueId_optionId_key" ON "PreventiveCaseValueOption"("valueId", "optionId");

-- CreateIndex
CREATE INDEX "BusinessPartner_tenantId_idx" ON "BusinessPartner"("tenantId");

-- CreateIndex
CREATE INDEX "BusinessPartner_tenantId_email_idx" ON "BusinessPartner"("tenantId", "email");

-- CreateIndex
CREATE INDEX "BusinessPartner_tenantId_phone_idx" ON "BusinessPartner"("tenantId", "phone");

-- CreateIndex
CREATE INDEX "BusinessPartner_tenantId_code_idx" ON "BusinessPartner"("tenantId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessPartner_tenantId_code_key" ON "BusinessPartner"("tenantId", "code");

-- CreateIndex
CREATE INDEX "ServiceType_tenantId_idx" ON "ServiceType"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceType_tenantId_code_key" ON "ServiceType"("tenantId", "code");

-- CreateIndex
CREATE INDEX "PartnerIdentifier_partnerId_idx" ON "PartnerIdentifier"("partnerId");

-- CreateIndex
CREATE INDEX "PartnerIdentifier_tenantId_type_value_idx" ON "PartnerIdentifier"("tenantId", "type", "value");

-- CreateIndex
CREATE INDEX "PartnerIdentifier_countryCode_idx" ON "PartnerIdentifier"("countryCode");

-- CreateIndex
CREATE INDEX "PartnerIdentifier_tenantId_value_idx" ON "PartnerIdentifier"("tenantId", "value");

-- CreateIndex
CREATE UNIQUE INDEX "PartnerIdentifier_tenantId_type_value_key" ON "PartnerIdentifier"("tenantId", "type", "value");

-- CreateIndex
CREATE INDEX "Country_currencyCode_idx" ON "Country"("currencyCode");

-- CreateIndex
CREATE INDEX "Specialty_tenantId_idx" ON "Specialty"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Specialty_tenantId_code_key" ON "Specialty"("tenantId", "code");

-- CreateIndex
CREATE INDEX "AuditLog_actorMembershipId_idx" ON "AuditLog"("actorMembershipId");

-- CreateIndex
CREATE INDEX "Session_tokenHash_idx" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_tenantId_userId_idx" ON "Session"("tenantId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_code_key" ON "Tenant"("code");

-- CreateIndex
CREATE INDEX "TenantMembership_tenantId_userId_idx" ON "TenantMembership"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "TenantMembership_tenantId_isActive_idx" ON "TenantMembership"("tenantId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "User_emailNormalized_key" ON "User"("emailNormalized");

-- CreateIndex
CREATE INDEX "User_emailNormalized_idx" ON "User"("emailNormalized");

-- AddForeignKey
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_defaultLocaleCode_fkey" FOREIGN KEY ("defaultLocaleCode") REFERENCES "Locale"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_defaultTimeZoneId_fkey" FOREIGN KEY ("defaultTimeZoneId") REFERENCES "TimeZone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_defaultCurrencyCode_fkey" FOREIGN KEY ("defaultCurrencyCode") REFERENCES "Currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES "Country"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgUnit" ADD CONSTRAINT "OrgUnit_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgUnit" ADD CONSTRAINT "OrgUnit_tenantId_parentCode_fkey" FOREIGN KEY ("tenantId", "parentCode") REFERENCES "OrgUnit"("tenantId", "code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES "Country"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantLocale" ADD CONSTRAINT "TenantLocale_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantLocale" ADD CONSTRAINT "TenantLocale_localeCode_fkey" FOREIGN KEY ("localeCode") REFERENCES "Locale"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessPartnerRole" ADD CONSTRAINT "BusinessPartnerRole_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessPartnerRole" ADD CONSTRAINT "BusinessPartnerRole_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "BusinessPartner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_localeCode_fkey" FOREIGN KEY ("localeCode") REFERENCES "Locale"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderProfile" ADD CONSTRAINT "ProviderProfile_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "BusinessPartner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderSpecialty" ADD CONSTRAINT "ProviderSpecialty_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "ProviderProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderSpecialty" ADD CONSTRAINT "ProviderSpecialty_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "Specialty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantMembership" ADD CONSTRAINT "TenantMembership_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantMembership" ADD CONSTRAINT "TenantMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembershipRole" ADD CONSTRAINT "MembershipRole_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "TenantMembership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembershipRole" ADD CONSTRAINT "MembershipRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorMembershipId_fkey" FOREIGN KEY ("actorMembershipId") REFERENCES "TenantMembership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthEvent" ADD CONSTRAINT "AuthEvent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NumberRange" ADD CONSTRAINT "NumberRange_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveTemplate" ADD CONSTRAINT "PreventiveTemplate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveTemplate" ADD CONSTRAINT "PreventiveTemplate_serviceTypeId_fkey" FOREIGN KEY ("serviceTypeId") REFERENCES "ServiceType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveTemplate" ADD CONSTRAINT "PreventiveTemplate_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "Specialty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveTemplate" ADD CONSTRAINT "PreventiveTemplate_publishedVersionId_fkey" FOREIGN KEY ("publishedVersionId") REFERENCES "PreventiveTemplateVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveTemplateSection" ADD CONSTRAINT "PreventiveTemplateSection_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveTemplateSection" ADD CONSTRAINT "PreventiveTemplateSection_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "PreventiveTemplateVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveTemplateVersion" ADD CONSTRAINT "PreventiveTemplateVersion_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveTemplateVersion" ADD CONSTRAINT "PreventiveTemplateVersion_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "PreventiveTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveTemplateField" ADD CONSTRAINT "PreventiveTemplateField_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveTemplateField" ADD CONSTRAINT "PreventiveTemplateField_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "PreventiveTemplateVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveTemplateField" ADD CONSTRAINT "PreventiveTemplateField_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "PreventiveTemplateSection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveFieldOption" ADD CONSTRAINT "PreventiveFieldOption_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveFieldOption" ADD CONSTRAINT "PreventiveFieldOption_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "PreventiveTemplateVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveFieldOption" ADD CONSTRAINT "PreventiveFieldOption_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "PreventiveTemplateField"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveCase" ADD CONSTRAINT "PreventiveCase_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveCase" ADD CONSTRAINT "PreventiveCase_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "BusinessPartner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveCase" ADD CONSTRAINT "PreventiveCase_providerProfileId_fkey" FOREIGN KEY ("providerProfileId") REFERENCES "ProviderProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveCase" ADD CONSTRAINT "PreventiveCase_orgUnitId_fkey" FOREIGN KEY ("orgUnitId") REFERENCES "OrgUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveCase" ADD CONSTRAINT "PreventiveCase_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveCase" ADD CONSTRAINT "PreventiveCase_templateVersionId_fkey" FOREIGN KEY ("templateVersionId") REFERENCES "PreventiveTemplateVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveCase" ADD CONSTRAINT "PreventiveCase_serviceTypeId_fkey" FOREIGN KEY ("serviceTypeId") REFERENCES "ServiceType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveCase" ADD CONSTRAINT "PreventiveCase_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "Specialty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveCaseValue" ADD CONSTRAINT "PreventiveCaseValue_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "PreventiveCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveCaseValue" ADD CONSTRAINT "PreventiveCaseValue_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "PreventiveTemplateField"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveCaseValue" ADD CONSTRAINT "PreventiveCaseValue_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "PreventiveFieldOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveCaseValueOption" ADD CONSTRAINT "PreventiveCaseValueOption_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveCaseValueOption" ADD CONSTRAINT "PreventiveCaseValueOption_valueId_fkey" FOREIGN KEY ("valueId") REFERENCES "PreventiveCaseValue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveCaseValueOption" ADD CONSTRAINT "PreventiveCaseValueOption_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "PreventiveFieldOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessPartner" ADD CONSTRAINT "BusinessPartner_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceType" ADD CONSTRAINT "ServiceType_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerIdentifier" ADD CONSTRAINT "PartnerIdentifier_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "BusinessPartner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerIdentifier" ADD CONSTRAINT "PartnerIdentifier_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES "Country"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Country" ADD CONSTRAINT "Country_currencyCode_fkey" FOREIGN KEY ("currencyCode") REFERENCES "Currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Specialty" ADD CONSTRAINT "Specialty_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
