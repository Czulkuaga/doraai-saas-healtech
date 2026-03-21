-- AlterTable
ALTER TABLE "BusinessPartner" ADD COLUMN     "emailNormalized" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "phoneNormalized" TEXT;
