-- CreateTable
CREATE TABLE "SystemInboxMessage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemInboxMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SystemInboxMessage_userId_createdAt_idx" ON "SystemInboxMessage"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "SystemInboxMessage_userId_readAt_idx" ON "SystemInboxMessage"("userId", "readAt");

-- AddForeignKey
ALTER TABLE "SystemInboxMessage" ADD CONSTRAINT "SystemInboxMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
