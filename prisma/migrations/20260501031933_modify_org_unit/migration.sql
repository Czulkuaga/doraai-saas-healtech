-- AlterEnum
ALTER TYPE "PreventiveValueKind" ADD VALUE 'FILE';

-- AlterTable
ALTER TABLE "OrgUnit" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
