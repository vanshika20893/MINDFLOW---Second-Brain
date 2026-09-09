const prisma = require("../db");
const authService = require("./auth.service");
const fileStore = require("../store/fileStore");

let isDatabaseConnected = null;

async function checkDatabaseConnection() {
  if (isDatabaseConnected !== null) return isDatabaseConnected;
  try {
    await prisma.$queryRaw`SELECT 1`;
    isDatabaseConnected = true;
    return true;
  } catch (error) {
    isDatabaseConnected = false;
    return false;
  }
}

/**
 * Save a new brain dump, strictly bound to the authenticated user.
 */
async function createDump(content, userId, metadata) {
  if (!userId) {
    const error = new Error("User ID is required to create a brain dump.");
    error.statusCode = 400;
    throw error;
  }

  const targetUser = await authService.findUserById(userId);
  if (!targetUser) {
    const error = new Error("User not found. Cannot attach thought to an invalid user account.");
    error.statusCode = 401;
    throw error;
  }

  const isDbAvailable = await checkDatabaseConnection();

  if (isDbAvailable) {
    try {
      const newDump = await prisma.brainDump.create({
        data: {
          content,
          userId: targetUser.id,
          metadata
        },
        include: {
          user: {
            select: { id: true, name: true, email: true }
          }
        }
      });
      return newDump;
    } catch (err) {
      console.warn("Prisma create failed, using file store:", err.message);
    }
  }

  const dumpId = `dump-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const newDump = {
    id: dumpId,
    userId: targetUser.id,
    content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: { id: targetUser.id, name: targetUser.name, email: targetUser.email },
    metadata
  };

  return fileStore.saveDump(newDump);
}

/**
 * Retrieve saved brain dumps strictly filtered for the specified user.
 */
async function getAllDumps(userId) {
  if (!userId) {
    // Strict isolation: Never return all dumps if userId is omitted
    return [];
  }

  const isDbAvailable = await checkDatabaseConnection();

  if (isDbAvailable) {
    try {
      const dumps = await prisma.brainDump.findMany({
        where: { userId },
        orderBy: {
          createdAt: "desc"
        },
        include: {
          user: {
            select: { id: true, name: true, email: true }
          }
        }
      });
      return dumps;
    } catch (err) {
      console.warn("Prisma findMany failed, using file store:", err.message);
    }
  }

  return fileStore.getDumps(userId);
}

/**
 * Retrieve a single brain dump by ID (with user check if provided).
 */
async function getDumpById(id, userId) {
  const isDbAvailable = await checkDatabaseConnection();

  if (isDbAvailable) {
    try {
      const where = userId ? { id, userId } : { id };
      const dump = await prisma.brainDump.findFirst({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true }
          }
        }
      });
      return dump;
    } catch (err) {
      console.warn("Prisma findFirst failed, using file store:", err.message);
    }
  }

  const dump = fileStore.findDumpById(id);
  if (!dump) return null;
  if (userId && dump.userId !== userId) return null;
  return dump;
}

/**
 * Delete a brain dump by ID strictly for the owning user.
 */
async function deleteDump(id, userId) {
  const isDbAvailable = await checkDatabaseConnection();
  if (isDbAvailable) {
    try {
      const where = userId ? { id, userId } : { id };
      await prisma.brainDump.deleteMany({ where });
    } catch (err) {
      console.warn("Prisma delete failed, using file store:", err.message);
    }
  }

  fileStore.deleteDump(id, userId);
  return { success: true };
}

module.exports = {
  createDump,
  getAllDumps,
  getDumpById,
  deleteDump
};
