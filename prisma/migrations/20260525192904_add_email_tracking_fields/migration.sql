-- CreateEnum
-- This migration adds email tracking fields to the Order table

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "receiptEmailSentAt" TIMESTAMP(3),
ADD COLUMN     "receiptEmailStatus" TEXT NOT NULL DEFAULT 'not_sent';