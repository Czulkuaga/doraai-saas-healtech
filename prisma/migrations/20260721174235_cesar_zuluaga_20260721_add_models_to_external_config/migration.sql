/*
  Warnings:

  - Changed the type of `operation` on the `IntegrationSyncLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ExternalCustomerLinkStatus" AS ENUM ('ACTIVE', 'NOT_FOUND', 'AMBIGUOUS', 'DISABLED');

-- CreateEnum
CREATE TYPE "IntegrationOperation" AS ENUM ('GET_TOKEN', 'SEARCH_CUSTOMER', 'CREATE_CUSTOMER', 'UPDATE_CUSTOMER', 'SEARCH_APPOINTMENT', 'CREATE_APPOINTMENT', 'UPDATE_APPOINTMENT', 'CANCEL_APPOINTMENT', 'VERIFY_INSURANCE', 'READ_IDENTITY');

-- AlterTable
ALTER TABLE "IntegrationSyncLog" DROP COLUMN "operation",
ADD COLUMN     "operation" "IntegrationOperation" NOT NULL;

-- CreateTable
CREATE TABLE "ExternalCustomerLink" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "system" "ExternalSystem" NOT NULL,
    "externalId" TEXT,
    "status" "ExternalCustomerLinkStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastMatchedAt" TIMESTAMP(3),
    "lastSyncedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExternalCustomerLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExternalCustomerLink_tenantId_system_externalId_idx" ON "ExternalCustomerLink"("tenantId", "system", "externalId");

-- CreateIndex
CREATE INDEX "ExternalCustomerLink_tenantId_status_idx" ON "ExternalCustomerLink"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalCustomerLink_tenantId_partnerId_system_key" ON "ExternalCustomerLink"("tenantId", "partnerId", "system");

-- AddForeignKey
ALTER TABLE "ExternalCustomerLink" ADD CONSTRAINT "ExternalCustomerLink_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "BusinessPartner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
