-- CreateEnum
CREATE TYPE "ClarificationStatus" AS ENUM ('OPEN', 'ANSWERED', 'CLOSED');

-- CreateTable
CREATE TABLE "Clarification" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "bidPackageId" TEXT NOT NULL,
    "bidId" TEXT,
    "bidderId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT,
    "status" "ClarificationStatus" NOT NULL DEFAULT 'OPEN',
    "answeredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Clarification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Clarification_organizationId_idx" ON "Clarification"("organizationId");

-- CreateIndex
CREATE INDEX "Clarification_bidPackageId_idx" ON "Clarification"("bidPackageId");

-- CreateIndex
CREATE INDEX "Clarification_bidId_idx" ON "Clarification"("bidId");

-- CreateIndex
CREATE INDEX "Clarification_bidderId_idx" ON "Clarification"("bidderId");

-- CreateIndex
CREATE INDEX "Clarification_status_idx" ON "Clarification"("status");

-- AddForeignKey
ALTER TABLE "Clarification" ADD CONSTRAINT "Clarification_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Clarification" ADD CONSTRAINT "Clarification_bidPackageId_fkey" FOREIGN KEY ("bidPackageId") REFERENCES "BidPackage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Clarification" ADD CONSTRAINT "Clarification_bidId_fkey" FOREIGN KEY ("bidId") REFERENCES "Bid"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Clarification" ADD CONSTRAINT "Clarification_bidderId_fkey" FOREIGN KEY ("bidderId") REFERENCES "Bidder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;