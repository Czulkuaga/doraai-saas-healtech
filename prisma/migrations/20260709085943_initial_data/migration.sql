-- CreateEnum
CREATE TYPE "MembershipCategory" AS ENUM ('SUPERADMIN', 'ADMIN', 'USER', 'PROFESSIONAL');

-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DELETED');

-- CreateEnum
CREATE TYPE "AuthEventType" AS ENUM ('LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT', 'SESSION_REVOKED', 'SESSION_EXPIRED', 'SESSION_IDLE_TIMEOUT', 'PASSWORD_RESET_REQUESTED', 'PASSWORD_RESET_COMPLETED');

-- CreateEnum
CREATE TYPE "PartnerType" AS ENUM ('PERSON', 'ORGANIZATION');

-- CreateEnum
CREATE TYPE "BPRoleType" AS ENUM ('PATIENT', 'GUARDIAN', 'EMERGENCY_CONTACT', 'PROVIDER', 'REFERRING_PROVIDER', 'INSURER', 'PAYER', 'SUPPLIER', 'LABORATORY', 'PHARMACY', 'CONTACT', 'STAFF');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "NumberRangeObject" AS ENUM ('BUSINESS_PARTNER', 'ORG_UNIT', 'LOCATION', 'APPOINTMENT', 'PREVENTIVE_CASE', 'PREVENTIVE_FOLLOW_UP', 'PREVENTIVE_CAMPAIGN');

-- CreateEnum
CREATE TYPE "TranslatableEntity" AS ENUM ('SPECIALTY', 'SERVICE_TYPE', 'ORG_UNIT', 'LOCATION');

-- CreateEnum
CREATE TYPE "TranslatableField" AS ENUM ('NAME', 'DESCRIPTION');

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

-- CreateEnum
CREATE TYPE "PreventiveCaseStatus" AS ENUM ('OPEN', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PatientProviderAssignmentType" AS ENUM ('PRIMARY_CARE', 'PREVENTIVE_FOLLOWUP', 'NURSING', 'SPECIALIST_SUPPORT', 'OTHER');

-- CreateEnum
CREATE TYPE "PreventiveRiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "PreventiveFollowUpStatus" AS ENUM ('PLANNED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'MISSED');

-- CreateEnum
CREATE TYPE "FollowUpFrequency" AS ENUM ('NONE', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'SEMIANNUAL', 'ANNUAL', 'CUSTOM');

-- CreateEnum
CREATE TYPE "PreventivePriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "PreventiveOutcome" AS ENUM ('NORMAL', 'STABLE', 'IMPROVED', 'ATTENTION_REQUIRED', 'REFERRED');

-- CreateEnum
CREATE TYPE "PreventiveFollowUpChannel" AS ENUM ('IN_PERSON', 'PHONE', 'VIDEO', 'WHATSAPP', 'HOME_VISIT');

-- CreateEnum
CREATE TYPE "PreventiveCampaignStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'RUNNING', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PreventiveCampaignChannel" AS ENUM ('WHATSAPP', 'EMAIL', 'SMS', 'PHONE');

-- CreateEnum
CREATE TYPE "PreventiveCampaignRecipientStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'READ', 'RESPONDED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PreventiveTimelineEventType" AS ENUM ('CASE_CREATED', 'CASE_UPDATED', 'CASE_COMPLETED', 'CASE_CANCELLED', 'FOLLOW_UP_CREATED', 'FOLLOW_UP_UPDATED', 'FOLLOW_UP_COMPLETED', 'FOLLOW_UP_CANCELLED', 'FOLLOW_UP_MISSED', 'CAMPAIGN_SENT', 'PATIENT_RESPONDED', 'PATHOLOGY_ADDED', 'PATHOLOGY_RESOLVED', 'PROVIDER_ASSIGNED', 'PROVIDER_REMOVED', 'NOTE_ADDED');

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "TenantStatus" NOT NULL DEFAULT 'ACTIVE',
    "deletedAt" TIMESTAMP(3),
    "countryCode" TEXT,
    "defaultLocaleCode" TEXT NOT NULL,
    "defaultTimeZoneId" TEXT NOT NULL,
    "defaultCurrencyCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgUnit" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
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
    "isActive" BOOLEAN NOT NULL DEFAULT true,
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
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailNormalized" TEXT NOT NULL,
    "name" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "phoneNormalized" TEXT,
    "passwordHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantMembership" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" "MembershipCategory" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TenantMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MembershipRole" (
    "id" TEXT NOT NULL,
    "membershipId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "MembershipRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "lastSeenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "actorMembershipId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT,
    "method" TEXT,
    "path" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "message" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthEvent" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "userId" TEXT,
    "type" "AuthEventType" NOT NULL,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "message" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "host" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthEvent_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "BusinessPartnerRole" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "role" "BPRoleType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BusinessPartnerRole_pkey" PRIMARY KEY ("id")
);

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
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "replacesId" TEXT,
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

-- CreateTable
CREATE TABLE "PreventiveCase" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT,
    "status" "PreventiveCaseStatus" NOT NULL DEFAULT 'OPEN',
    "patientId" TEXT NOT NULL,
    "pathologyId" TEXT,
    "providerProfileId" TEXT,
    "orgUnitId" TEXT,
    "locationId" TEXT,
    "serviceTypeId" TEXT,
    "specialtyId" TEXT,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "notes" TEXT,
    "riskLevel" "PreventiveRiskLevel",
    "followUpFrequency" "FollowUpFrequency" NOT NULL DEFAULT 'NONE',
    "followUpIntervalDays" INTEGER,
    "nextFollowUpAt" TIMESTAMP(3),
    "lastFollowUpAt" TIMESTAMP(3),
    "nextAutomaticFollowUpAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PreventiveCase_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "PreventiveFollowUp" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "preventiveCaseId" TEXT NOT NULL,
    "pathologyId" TEXT,
    "providerProfileId" TEXT,
    "orgUnitId" TEXT,
    "locationId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "notes" TEXT,
    "durationMinutes" INTEGER,
    "status" "PreventiveFollowUpStatus" NOT NULL DEFAULT 'PLANNED',
    "priority" "PreventivePriority" NOT NULL DEFAULT 'NORMAL',
    "channel" "PreventiveFollowUpChannel" NOT NULL DEFAULT 'IN_PERSON',
    "outcome" "PreventiveOutcome",
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "performedAt" TIMESTAMP(3),
    "nextFollowUpAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PreventiveFollowUp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreventiveCampaign" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "PreventiveCampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "channel" "PreventiveCampaignChannel" NOT NULL DEFAULT 'WHATSAPP',
    "pathologyId" TEXT,
    "serviceTypeId" TEXT,
    "specialtyId" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "targetDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PreventiveCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreventiveCampaignRecipient" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "status" "PreventiveCampaignRecipientStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "respondedAt" TIMESTAMP(3),
    "responseText" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PreventiveCampaignRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreventiveTimelineEvent" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "preventiveCaseId" TEXT,
    "followUpId" TEXT,
    "campaignRecipientId" TEXT,
    "type" "PreventiveTimelineEventType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PreventiveTimelineEvent_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "BusinessPartner" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "PartnerType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "firstName" TEXT,
    "lastName" TEXT,
    "organizationName" TEXT,
    "email" TEXT,
    "emailNormalized" TEXT,
    "phone" TEXT,
    "phoneNormalized" TEXT,
    "birthDate" TIMESTAMP(3),
    "gender" "Gender",
    "nationalityCode" TEXT,
    "preferredLanguageCode" TEXT,
    "deceasedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "localeCode" TEXT,

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
CREATE UNIQUE INDEX "Tenant_code_key" ON "Tenant"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

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
CREATE UNIQUE INDEX "User_emailNormalized_key" ON "User"("emailNormalized");

-- CreateIndex
CREATE INDEX "User_emailNormalized_idx" ON "User"("emailNormalized");

-- CreateIndex
CREATE INDEX "User_phoneNormalized_idx" ON "User"("phoneNormalized");

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNormalized_key" ON "User"("phoneNormalized");

-- CreateIndex
CREATE INDEX "Role_tenantId_idx" ON "Role"("tenantId");

-- CreateIndex
CREATE INDEX "Role_tenantId_isActive_idx" ON "Role"("tenantId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Role_tenantId_key_key" ON "Role"("tenantId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_key_key" ON "Permission"("key");

-- CreateIndex
CREATE INDEX "RolePermission_roleId_idx" ON "RolePermission"("roleId");

-- CreateIndex
CREATE INDEX "RolePermission_permissionId_idx" ON "RolePermission"("permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_roleId_permissionId_key" ON "RolePermission"("roleId", "permissionId");

-- CreateIndex
CREATE INDEX "TenantMembership_tenantId_idx" ON "TenantMembership"("tenantId");

-- CreateIndex
CREATE INDEX "TenantMembership_userId_idx" ON "TenantMembership"("userId");

-- CreateIndex
CREATE INDEX "TenantMembership_tenantId_userId_idx" ON "TenantMembership"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "TenantMembership_tenantId_isActive_idx" ON "TenantMembership"("tenantId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "TenantMembership_tenantId_userId_key" ON "TenantMembership"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "MembershipRole_membershipId_idx" ON "MembershipRole"("membershipId");

-- CreateIndex
CREATE INDEX "MembershipRole_roleId_idx" ON "MembershipRole"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "MembershipRole_membershipId_roleId_key" ON "MembershipRole"("membershipId", "roleId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_tenantId_idx" ON "Session"("tenantId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE INDEX "Session_revokedAt_idx" ON "Session"("revokedAt");

-- CreateIndex
CREATE INDEX "Session_tokenHash_idx" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_tenantId_userId_idx" ON "Session"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "AuditLog_tenantId_createdAt_idx" ON "AuditLog"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_actorMembershipId_idx" ON "AuditLog"("actorMembershipId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuthEvent_tenantId_createdAt_idx" ON "AuthEvent"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "AuthEvent_userId_createdAt_idx" ON "AuthEvent"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AuthEvent_type_createdAt_idx" ON "AuthEvent"("type", "createdAt");

-- CreateIndex
CREATE INDEX "NumberRange_tenantId_idx" ON "NumberRange"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "NumberRange_tenantId_object_key" ON "NumberRange"("tenantId", "object");

-- CreateIndex
CREATE INDEX "BusinessPartnerRole_tenantId_role_idx" ON "BusinessPartnerRole"("tenantId", "role");

-- CreateIndex
CREATE INDEX "BusinessPartnerRole_tenantId_partnerId_idx" ON "BusinessPartnerRole"("tenantId", "partnerId");

-- CreateIndex
CREATE INDEX "BusinessPartnerRole_role_idx" ON "BusinessPartnerRole"("role");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessPartnerRole_tenantId_partnerId_role_key" ON "BusinessPartnerRole"("tenantId", "partnerId", "role");

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
CREATE INDEX "BusinessPartnerIdentity_tenantId_isActive_idx" ON "BusinessPartnerIdentity"("tenantId", "isActive");

-- CreateIndex
CREATE INDEX "BusinessPartnerIdentity_tenantId_replacesId_idx" ON "BusinessPartnerIdentity"("tenantId", "replacesId");

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
CREATE INDEX "PreventiveCase_tenantId_idx" ON "PreventiveCase"("tenantId");

-- CreateIndex
CREATE INDEX "PreventiveCase_tenantId_status_idx" ON "PreventiveCase"("tenantId", "status");

-- CreateIndex
CREATE INDEX "PreventiveCase_tenantId_patientId_idx" ON "PreventiveCase"("tenantId", "patientId");

-- CreateIndex
CREATE INDEX "PreventiveCase_tenantId_patientId_status_idx" ON "PreventiveCase"("tenantId", "patientId", "status");

-- CreateIndex
CREATE INDEX "PreventiveCase_tenantId_pathologyId_idx" ON "PreventiveCase"("tenantId", "pathologyId");

-- CreateIndex
CREATE INDEX "PreventiveCase_tenantId_patientId_pathologyId_idx" ON "PreventiveCase"("tenantId", "patientId", "pathologyId");

-- CreateIndex
CREATE INDEX "PreventiveCase_tenantId_providerProfileId_idx" ON "PreventiveCase"("tenantId", "providerProfileId");

-- CreateIndex
CREATE INDEX "PreventiveCase_tenantId_orgUnitId_idx" ON "PreventiveCase"("tenantId", "orgUnitId");

-- CreateIndex
CREATE INDEX "PreventiveCase_tenantId_locationId_idx" ON "PreventiveCase"("tenantId", "locationId");

-- CreateIndex
CREATE UNIQUE INDEX "PreventiveCase_tenantId_code_key" ON "PreventiveCase"("tenantId", "code");

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

-- CreateIndex
CREATE INDEX "PreventiveFollowUp_tenantId_idx" ON "PreventiveFollowUp"("tenantId");

-- CreateIndex
CREATE INDEX "PreventiveFollowUp_tenantId_patientId_idx" ON "PreventiveFollowUp"("tenantId", "patientId");

-- CreateIndex
CREATE INDEX "PreventiveFollowUp_tenantId_preventiveCaseId_idx" ON "PreventiveFollowUp"("tenantId", "preventiveCaseId");

-- CreateIndex
CREATE INDEX "PreventiveFollowUp_tenantId_pathologyId_idx" ON "PreventiveFollowUp"("tenantId", "pathologyId");

-- CreateIndex
CREATE INDEX "PreventiveFollowUp_tenantId_providerProfileId_idx" ON "PreventiveFollowUp"("tenantId", "providerProfileId");

-- CreateIndex
CREATE INDEX "PreventiveFollowUp_tenantId_status_idx" ON "PreventiveFollowUp"("tenantId", "status");

-- CreateIndex
CREATE INDEX "PreventiveFollowUp_tenantId_scheduledFor_idx" ON "PreventiveFollowUp"("tenantId", "scheduledFor");

-- CreateIndex
CREATE INDEX "PreventiveFollowUp_tenantId_patientId_status_idx" ON "PreventiveFollowUp"("tenantId", "patientId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "PreventiveFollowUp_tenantId_code_key" ON "PreventiveFollowUp"("tenantId", "code");

-- CreateIndex
CREATE INDEX "PreventiveCampaign_tenantId_idx" ON "PreventiveCampaign"("tenantId");

-- CreateIndex
CREATE INDEX "PreventiveCampaign_tenantId_status_idx" ON "PreventiveCampaign"("tenantId", "status");

-- CreateIndex
CREATE INDEX "PreventiveCampaign_tenantId_pathologyId_idx" ON "PreventiveCampaign"("tenantId", "pathologyId");

-- CreateIndex
CREATE INDEX "PreventiveCampaign_tenantId_scheduledAt_idx" ON "PreventiveCampaign"("tenantId", "scheduledAt");

-- CreateIndex
CREATE UNIQUE INDEX "PreventiveCampaign_tenantId_code_key" ON "PreventiveCampaign"("tenantId", "code");

-- CreateIndex
CREATE INDEX "PreventiveCampaignRecipient_tenantId_idx" ON "PreventiveCampaignRecipient"("tenantId");

-- CreateIndex
CREATE INDEX "PreventiveCampaignRecipient_tenantId_campaignId_idx" ON "PreventiveCampaignRecipient"("tenantId", "campaignId");

-- CreateIndex
CREATE INDEX "PreventiveCampaignRecipient_tenantId_patientId_idx" ON "PreventiveCampaignRecipient"("tenantId", "patientId");

-- CreateIndex
CREATE INDEX "PreventiveCampaignRecipient_tenantId_status_idx" ON "PreventiveCampaignRecipient"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "PreventiveCampaignRecipient_tenantId_campaignId_patientId_key" ON "PreventiveCampaignRecipient"("tenantId", "campaignId", "patientId");

-- CreateIndex
CREATE INDEX "PreventiveTimelineEvent_tenantId_idx" ON "PreventiveTimelineEvent"("tenantId");

-- CreateIndex
CREATE INDEX "PreventiveTimelineEvent_tenantId_patientId_idx" ON "PreventiveTimelineEvent"("tenantId", "patientId");

-- CreateIndex
CREATE INDEX "PreventiveTimelineEvent_tenantId_preventiveCaseId_idx" ON "PreventiveTimelineEvent"("tenantId", "preventiveCaseId");

-- CreateIndex
CREATE INDEX "PreventiveTimelineEvent_tenantId_followUpId_idx" ON "PreventiveTimelineEvent"("tenantId", "followUpId");

-- CreateIndex
CREATE INDEX "PreventiveTimelineEvent_tenantId_occurredAt_idx" ON "PreventiveTimelineEvent"("tenantId", "occurredAt");

-- CreateIndex
CREATE INDEX "PreventiveTimelineEvent_tenantId_patientId_occurredAt_idx" ON "PreventiveTimelineEvent"("tenantId", "patientId", "occurredAt");

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

-- CreateIndex
CREATE INDEX "BusinessPartner_tenantId_idx" ON "BusinessPartner"("tenantId");

-- CreateIndex
CREATE INDEX "BusinessPartner_tenantId_email_idx" ON "BusinessPartner"("tenantId", "email");

-- CreateIndex
CREATE INDEX "BusinessPartner_tenantId_phone_idx" ON "BusinessPartner"("tenantId", "phone");

-- CreateIndex
CREATE INDEX "BusinessPartner_tenantId_code_idx" ON "BusinessPartner"("tenantId", "code");

-- CreateIndex
CREATE INDEX "BusinessPartner_tenantId_birthDate_idx" ON "BusinessPartner"("tenantId", "birthDate");

-- CreateIndex
CREATE INDEX "BusinessPartner_tenantId_gender_idx" ON "BusinessPartner"("tenantId", "gender");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessPartner_tenantId_code_key" ON "BusinessPartner"("tenantId", "code");

-- CreateIndex
CREATE INDEX "ServiceType_tenantId_idx" ON "ServiceType"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceType_tenantId_code_key" ON "ServiceType"("tenantId", "code");

-- CreateIndex
CREATE INDEX "Country_currencyCode_idx" ON "Country"("currencyCode");

-- CreateIndex
CREATE INDEX "Specialty_tenantId_idx" ON "Specialty"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Specialty_tenantId_code_key" ON "Specialty"("tenantId", "code");

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
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorMembershipId_fkey" FOREIGN KEY ("actorMembershipId") REFERENCES "TenantMembership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthEvent" ADD CONSTRAINT "AuthEvent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthEvent" ADD CONSTRAINT "AuthEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NumberRange" ADD CONSTRAINT "NumberRange_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessPartnerRole" ADD CONSTRAINT "BusinessPartnerRole_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessPartnerRole" ADD CONSTRAINT "BusinessPartnerRole_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "BusinessPartner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "BusinessPartnerIdentity" ADD CONSTRAINT "BusinessPartnerIdentity_replacesId_fkey" FOREIGN KEY ("replacesId") REFERENCES "BusinessPartnerIdentity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientInsuranceCoverage" ADD CONSTRAINT "PatientInsuranceCoverage_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "BusinessPartner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessPartnerExternalRef" ADD CONSTRAINT "BusinessPartnerExternalRef_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "BusinessPartner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationSyncLog" ADD CONSTRAINT "IntegrationSyncLog_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "BusinessPartner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveCase" ADD CONSTRAINT "PreventiveCase_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveCase" ADD CONSTRAINT "PreventiveCase_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "BusinessPartner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveCase" ADD CONSTRAINT "PreventiveCase_pathologyId_fkey" FOREIGN KEY ("pathologyId") REFERENCES "Pathology"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveCase" ADD CONSTRAINT "PreventiveCase_providerProfileId_fkey" FOREIGN KEY ("providerProfileId") REFERENCES "ProviderProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveCase" ADD CONSTRAINT "PreventiveCase_orgUnitId_fkey" FOREIGN KEY ("orgUnitId") REFERENCES "OrgUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveCase" ADD CONSTRAINT "PreventiveCase_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveCase" ADD CONSTRAINT "PreventiveCase_serviceTypeId_fkey" FOREIGN KEY ("serviceTypeId") REFERENCES "ServiceType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveCase" ADD CONSTRAINT "PreventiveCase_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "Specialty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientProviderAssignment" ADD CONSTRAINT "PatientProviderAssignment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientProviderAssignment" ADD CONSTRAINT "PatientProviderAssignment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "BusinessPartner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientProviderAssignment" ADD CONSTRAINT "PatientProviderAssignment_providerProfileId_fkey" FOREIGN KEY ("providerProfileId") REFERENCES "ProviderProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveFollowUp" ADD CONSTRAINT "PreventiveFollowUp_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveFollowUp" ADD CONSTRAINT "PreventiveFollowUp_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "BusinessPartner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveFollowUp" ADD CONSTRAINT "PreventiveFollowUp_preventiveCaseId_fkey" FOREIGN KEY ("preventiveCaseId") REFERENCES "PreventiveCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveFollowUp" ADD CONSTRAINT "PreventiveFollowUp_pathologyId_fkey" FOREIGN KEY ("pathologyId") REFERENCES "Pathology"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveFollowUp" ADD CONSTRAINT "PreventiveFollowUp_providerProfileId_fkey" FOREIGN KEY ("providerProfileId") REFERENCES "ProviderProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveFollowUp" ADD CONSTRAINT "PreventiveFollowUp_orgUnitId_fkey" FOREIGN KEY ("orgUnitId") REFERENCES "OrgUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveFollowUp" ADD CONSTRAINT "PreventiveFollowUp_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveCampaign" ADD CONSTRAINT "PreventiveCampaign_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveCampaign" ADD CONSTRAINT "PreventiveCampaign_pathologyId_fkey" FOREIGN KEY ("pathologyId") REFERENCES "Pathology"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveCampaign" ADD CONSTRAINT "PreventiveCampaign_serviceTypeId_fkey" FOREIGN KEY ("serviceTypeId") REFERENCES "ServiceType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveCampaign" ADD CONSTRAINT "PreventiveCampaign_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "Specialty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveCampaignRecipient" ADD CONSTRAINT "PreventiveCampaignRecipient_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveCampaignRecipient" ADD CONSTRAINT "PreventiveCampaignRecipient_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "PreventiveCampaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveCampaignRecipient" ADD CONSTRAINT "PreventiveCampaignRecipient_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "BusinessPartner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveTimelineEvent" ADD CONSTRAINT "PreventiveTimelineEvent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveTimelineEvent" ADD CONSTRAINT "PreventiveTimelineEvent_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "BusinessPartner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveTimelineEvent" ADD CONSTRAINT "PreventiveTimelineEvent_preventiveCaseId_fkey" FOREIGN KEY ("preventiveCaseId") REFERENCES "PreventiveCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveTimelineEvent" ADD CONSTRAINT "PreventiveTimelineEvent_followUpId_fkey" FOREIGN KEY ("followUpId") REFERENCES "PreventiveFollowUp"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveTimelineEvent" ADD CONSTRAINT "PreventiveTimelineEvent_campaignRecipientId_fkey" FOREIGN KEY ("campaignRecipientId") REFERENCES "PreventiveCampaignRecipient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pathology" ADD CONSTRAINT "Pathology_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientPathology" ADD CONSTRAINT "PatientPathology_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientPathology" ADD CONSTRAINT "PatientPathology_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "BusinessPartner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientPathology" ADD CONSTRAINT "PatientPathology_pathologyId_fkey" FOREIGN KEY ("pathologyId") REFERENCES "Pathology"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessPartner" ADD CONSTRAINT "BusinessPartner_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessPartner" ADD CONSTRAINT "BusinessPartner_nationalityCode_fkey" FOREIGN KEY ("nationalityCode") REFERENCES "Country"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessPartner" ADD CONSTRAINT "BusinessPartner_preferredLanguageCode_fkey" FOREIGN KEY ("preferredLanguageCode") REFERENCES "Locale"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceType" ADD CONSTRAINT "ServiceType_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Country" ADD CONSTRAINT "Country_currencyCode_fkey" FOREIGN KEY ("currencyCode") REFERENCES "Currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Specialty" ADD CONSTRAINT "Specialty_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
