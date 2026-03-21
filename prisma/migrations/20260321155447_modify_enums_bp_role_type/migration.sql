-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "BPRoleType" ADD VALUE 'GUARDIAN';
ALTER TYPE "BPRoleType" ADD VALUE 'EMERGENCY_CONTACT';
ALTER TYPE "BPRoleType" ADD VALUE 'REFERRING_PROVIDER';
ALTER TYPE "BPRoleType" ADD VALUE 'PAYER';
ALTER TYPE "BPRoleType" ADD VALUE 'LABORATORY';
ALTER TYPE "BPRoleType" ADD VALUE 'PHARMACY';
