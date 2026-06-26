-- AlterTable
ALTER TABLE "PreventiveCase" ADD COLUMN     "lastFollowUpAt" TIMESTAMP(3),
ADD COLUMN     "nextAutomaticFollowUpAt" TIMESTAMP(3);
