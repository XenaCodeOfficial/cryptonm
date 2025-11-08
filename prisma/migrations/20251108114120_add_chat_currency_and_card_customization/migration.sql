-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "budgetCurrency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "cardColor" TEXT NOT NULL DEFAULT '#1a1a2e',
ADD COLUMN     "cardDesign" TEXT NOT NULL DEFAULT 'gradient',
ADD COLUMN     "cardGradient" TEXT;

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChatMessage_createdAt_idx" ON "ChatMessage"("createdAt");

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;
