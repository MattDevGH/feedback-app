-- AlterTable
ALTER TABLE "ReviewToken" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN     "usedAt" TIMESTAMP(3);
