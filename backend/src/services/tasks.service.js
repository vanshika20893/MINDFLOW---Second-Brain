const fileStore = require("../store/fileStore");

/**
 * Get all tasks for a specific user.
 */
async function getAllTasks(userId) {
  if (!userId) return [];
  return fileStore.getTasks(userId);
}

/**
 * Create a new task (manual task or persisted item) bound to userId.
 */
async function createTask(data, userId) {
  if (!userId) {
    const err = new Error("User ID is required to create a task.");
    err.statusCode = 401;
    throw err;
  }

  const taskId = data.id || `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const task = {
    id: taskId,
    userId,
    title: data.title,
    sourceDumpTitle: data.sourceDumpTitle || "Manual entry",
    type: data.type || "TODO",
    priority: data.priority || "ROUTINE",
    timeframe: data.timeframe || "Today",
    dueDate: data.dueDate || "Today",
    completed: Boolean(data.completed),
    tags: Array.isArray(data.tags) ? data.tags : ["quick-task"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return fileStore.saveTask(task);
}

/**
 * Update task attributes (such as toggle completion status).
 */
async function updateTask(id, updates, userId) {
  if (!userId) {
    const err = new Error("User ID is required.");
    err.statusCode = 401;
    throw err;
  }

  const updated = fileStore.updateTask(id, updates, userId);
  if (!updated) {
    const err = new Error(`Task '${id}' not found or does not belong to user.`);
    err.statusCode = 404;
    throw err;
  }
  return updated;
}

/**
 * Delete a task.
 */
async function deleteTask(id, userId) {
  if (!userId) {
    const err = new Error("User ID is required.");
    err.statusCode = 401;
    throw err;
  }
  fileStore.deleteTask(id, userId);
  return { success: true };
}

module.exports = {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask
};
