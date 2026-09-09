const dumpsService = require("../services/dumps.service");

/**
 * POST /api/dumps
 * Receives a thought from the client, validates it, and saves it bound to the user.
 */
async function createDump(req, res, next) {
  try {
    const { content, metadata } = req.body || {};
    const userId = req.headers["x-user-id"] || req.body?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required. Missing user ID."
      });
    }

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Content is required and cannot be empty."
      });
    }

    const savedDump = await dumpsService.createDump(content.trim(), userId, metadata);

    return res.status(201).json({
      success: true,
      message: "Brain dump created successfully",
      data: savedDump
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: error.message || "Failed to create brain dump"
    });
  }
}

/**
 * GET /api/dumps
 * Retrieves saved brain dumps strictly for the authenticated user.
 */
async function getDumps(req, res, next) {
  try {
    const userId = req.headers["x-user-id"] || req.query?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required. Missing user ID."
      });
    }

    const dumps = await dumpsService.getAllDumps(userId);

    return res.status(200).json({
      success: true,
      count: dumps.length,
      data: dumps
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/dumps/:id
 * Retrieves a single brain dump by its ID.
 */
async function getDumpById(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.headers["x-user-id"] || req.query?.userId;
    const dump = await dumpsService.getDumpById(id, userId);

    if (!dump) {
      return res.status(404).json({
        success: false,
        error: `Brain dump with id '${id}' not found.`
      });
    }

    return res.status(200).json({
      success: true,
      data: dump
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/dumps/:id
 * Deletes a dump strictly for the owner.
 */
async function deleteDump(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.headers["x-user-id"] || req.body?.userId;
    await dumpsService.deleteDump(id, userId);
    return res.status(200).json({
      success: true,
      message: `Brain dump '${id}' deleted successfully.`
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createDump,
  getDumps,
  getDumpById,
  deleteDump
};
