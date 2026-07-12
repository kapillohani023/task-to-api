import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export function getAgent(id: string) {
  return prisma.agent.findUnique({ where: { id } });
}

export function getAgentWithServers(id: string) {
  return prisma.agent.findUnique({
    where: { id },
    include: { mcpServers: { orderBy: { createdAt: "asc" } } },
  });
}

export function getAgentsByUser(userId: string) {
  return prisma.agent.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export function createAgent(data: Prisma.AgentCreateInput) {
  return prisma.agent.create({ data });
}

export function updateAgent(id: string, data: Prisma.AgentUpdateInput) {
  return prisma.agent.update({ where: { id }, data });
}

export function deleteAgent(id: string) {
  return prisma.agent.delete({ where: { id } });
}
