import { PrismaClient } from "@prisma/client";

declare global {
  // Extend globalThis to include a prisma property
  var prisma: PrismaClient | undefined;
}
