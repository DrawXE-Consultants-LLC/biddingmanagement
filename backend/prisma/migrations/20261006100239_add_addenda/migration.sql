-- CreateEnum
CREATE TYPE "AddendumStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Addendum" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "bidPackageId" TEXT,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "AddendumStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Addendum_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Addendum_organizationId_idx" ON "Addendum"("organizationId");

-- CreateIndex
CREATE INDEX "Addendum_projectId_idx" ON "Addendum"("projectId");

-- CreateIndex
CREATE INDEX "Addendum_bidPackageId_idx" ON "Addendum"("bidPackageId");

-- CreateIndex
CREATE INDEX "Addendum_status_idx" ON "Addendum"("status");

-- AddForeignKey
ALTER TABLE "Addendum" ADD CONSTRAINT "Addendum_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Addendum" ADD CONSTRAINT "Addendum_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Addendum" ADD CONSTRAINT "Addendum_bidPackageId_fkey" FOREIGN KEY ("bidPackageId") REFERENCES "BidPackage"("id") ON DELETE SET NULL ON UPDATE CASCADE;