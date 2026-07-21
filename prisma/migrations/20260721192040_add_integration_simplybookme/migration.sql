-- CreateEnum
CREATE TYPE "IntegrationConnectionStatus" AS ENUM ('NOT_CONFIGURED', 'CONNECTING', 'CONNECTED', 'TWO_FACTOR_REQUIRED', 'EXPIRED', 'ERROR', 'DISABLED');

-- CreateEnum
CREATE TYPE "IntegrationAuthType" AS ENUM ('API_USER_KEY', 'USER_PASSWORD', 'OAUTH2', 'CUSTOM');

-- CreateTable
CREATE TABLE "IntegrationConnection" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "system" "ExternalSystem" NOT NULL,
    "authType" "IntegrationAuthType" NOT NULL,
    "status" "IntegrationConnectionStatus" NOT NULL DEFAULT 'NOT_CONFIGURED',
    "displayName" TEXT,
    "companyLogin" TEXT,
    "userLogin" TEXT,
    "apiBaseUrl" TEXT,
    "domain" TEXT,
    "apiUserKeyEncrypted" TEXT,
    "passwordEncrypted" TEXT,
    "accessTokenEncrypted" TEXT,
    "refreshTokenEncrypted" TEXT,
    "deviceTokenEncrypted" TEXT,
    "require2fa" BOOLEAN NOT NULL DEFAULT false,
    "authSessionId" TEXT,
    "allowed2faProviders" JSONB,
    "connectedAt" TIMESTAMP(3),
    "lastValidatedAt" TIMESTAMP(3),
    "lastAuthAttemptAt" TIMESTAMP(3),
    "lastRefreshAt" TIMESTAMP(3),
    "lastErrorAt" TIMESTAMP(3),
    "lastErrorCode" TEXT,
    "lastErrorMessage" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntegrationConnection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IntegrationConnection_tenantId_idx" ON "IntegrationConnection"("tenantId");

-- CreateIndex
CREATE INDEX "IntegrationConnection_tenantId_status_idx" ON "IntegrationConnection"("tenantId", "status");

-- CreateIndex
CREATE INDEX "IntegrationConnection_tenantId_system_status_idx" ON "IntegrationConnection"("tenantId", "system", "status");

-- CreateIndex
CREATE UNIQUE INDEX "IntegrationConnection_tenantId_system_key" ON "IntegrationConnection"("tenantId", "system");
