const { PrismaClient } = require("@prisma/client");

/**
 * Single shared Prisma Client instance for the entire application.
 * Reusing this instance ensures efficient connection management with PostgreSQL.
 */
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "info", "warn", "error"] : ["error"]
});

module.exports = prisma;
