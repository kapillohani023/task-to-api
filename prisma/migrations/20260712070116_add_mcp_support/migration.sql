-- AlterTable
ALTER TABLE "agents" ADD COLUMN     "maxToolRounds" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "mcpEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "timeoutMs" INTEGER NOT NULL DEFAULT 60000;

-- CreateTable
CREATE TABLE "mcp_servers" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "headers" TEXT NOT NULL DEFAULT '[]',
    "disabledTools" TEXT NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "agentId" TEXT NOT NULL,

    CONSTRAINT "mcp_servers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "mcp_servers_agentId_idx" ON "mcp_servers"("agentId");

-- AddForeignKey
ALTER TABLE "mcp_servers" ADD CONSTRAINT "mcp_servers_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
