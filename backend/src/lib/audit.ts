import { randomUUID } from "node:crypto";
import { db } from "../db/connection.js";
import { auditLogs } from "../db/schema.js";

interface AuditLogInput {
  userId?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  details?: unknown;
  ipAddress?: string;
  userAgent?: string;
}

export async function writeAuditLog(input: AuditLogInput): Promise<void> {
  await db.insert(auditLogs).values({
    id: randomUUID(),
    userId: input.userId,
    action: input.action,
    resourceType: input.resourceType,
    resourceId: input.resourceId,
    details: input.details ? JSON.stringify(input.details) : undefined,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });
}
