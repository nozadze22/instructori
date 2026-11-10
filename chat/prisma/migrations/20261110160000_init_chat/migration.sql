-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "userLowId" TEXT NOT NULL,
    "userHighId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatThreadClear" (
    "id" TEXT NOT NULL,
    "userLowId" TEXT NOT NULL,
    "userHighId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clearedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatThreadClear_pkey" PRIMARY KEY ("id")
);

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
CREATE INDEX "ChatMessage_userLowId_userHighId_createdAt_idx" ON "ChatMessage"("userLowId", "userHighId", "createdAt");

-- CreateIndex
CREATE INDEX "ChatMessage_senderId_createdAt_idx" ON "ChatMessage"("senderId", "createdAt");

-- CreateIndex
CREATE INDEX "ChatThreadClear_userId_idx" ON "ChatThreadClear"("userId");

-- CreateIndex
CREATE INDEX "ChatThreadClear_userLowId_userHighId_idx" ON "ChatThreadClear"("userLowId", "userHighId");

-- CreateIndex
CREATE UNIQUE INDEX "ChatThreadClear_userLowId_userHighId_userId_key" ON "ChatThreadClear"("userLowId", "userHighId", "userId");

-- CreateIndex
CREATE INDEX "SystemInboxMessage_userId_createdAt_idx" ON "SystemInboxMessage"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "SystemInboxMessage_userId_readAt_idx" ON "SystemInboxMessage"("userId", "readAt");
