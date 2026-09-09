const tasksService = require("../services/tasks.service");

/**
 * GET /api/tasks
 * Fetch all tasks for the authenticated user.
 */
async function getTasks(req, res, next) {
  try {
    const userId = req.headers["x-user-id"] || req.query?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required. Missing user ID."
      });
    }

    const tasks = await tasksService.getAllTasks(userId);
    return res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/tasks
 * Create a new task.
 */
async function createTask(req, res, next) {
  try {
    const userId = req.headers["x-user-id"] || req.body?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required. Missing user ID."
      });
    }

    const { title } = req.body || {};
    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        success: false,
        error: "Task title is required."
      });
    }

    const task = await tasksService.createTask(req.body, userId);
    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: task
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: error.message || "Failed to create task"
    });
  }
}

/**
 * PATCH /api/tasks/:id
 * Update task fields (e.g. completed: true/false).
 */
async function updateTask(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.headers["x-user-id"] || req.body?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required. Missing user ID."
      });
    }

    const updated = await tasksService.updateTask(id, req.body, userId);
    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: updated
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: error.message || "Failed to update task"
    });
  }
}

/**
 * DELETE /api/tasks/:id
 * Delete a task.
 */
async function deleteTask(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.headers["x-user-id"] || req.body?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required. Missing user ID."
      });
    }

    await tasksService.deleteTask(id, userId);
    return res.status(200).json({
      success: true,
      message: `Task '${id}' deleted successfully.`
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask
};
