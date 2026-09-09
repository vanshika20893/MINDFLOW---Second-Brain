const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../../data");
const STORE_PATH = path.join(DATA_DIR, "store.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let inMemoryCache = null;

function loadStore() {
  if (inMemoryCache) return inMemoryCache;

  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, "utf-8");
      inMemoryCache = JSON.parse(raw);
    } else {
      inMemoryCache = { users: [], dumps: [], tasks: [] };
      saveStore();
    }
  } catch (err) {
    console.warn("⚠️ Failed to read store.json, initializing empty store:", err.message);
    inMemoryCache = { users: [], dumps: [], tasks: [] };
  }

  // Ensure all keys exist
  if (!Array.isArray(inMemoryCache.users)) inMemoryCache.users = [];
  if (!Array.isArray(inMemoryCache.dumps)) inMemoryCache.dumps = [];
  if (!Array.isArray(inMemoryCache.tasks)) inMemoryCache.tasks = [];

  return inMemoryCache;
}

function saveStore() {
  if (!inMemoryCache) return;
  try {
    const tempPath = `${STORE_PATH}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(inMemoryCache, null, 2), "utf-8");
    fs.renameSync(tempPath, STORE_PATH);
  } catch (err) {
    console.error("❌ Failed to persist store to disk:", err.message);
  }
}

// ============================================================================
// USER OPERATIONS
// ============================================================================

function getUsers() {
  const store = loadStore();
  return store.users;
}

function findUserById(id) {
  if (!id) return null;
  const store = loadStore();
  return store.users.find((u) => u.id === id) || null;
}

function findUserByEmail(email) {
  if (!email) return null;
  const cleanEmail = email.trim().toLowerCase();
  const store = loadStore();
  return store.users.find((u) => u.email.toLowerCase() === cleanEmail) || null;
}

function saveUser(user) {
  const store = loadStore();
  const existingIdx = store.users.findIndex((u) => u.id === user.id);
  if (existingIdx >= 0) {
    store.users[existingIdx] = { ...store.users[existingIdx], ...user, updatedAt: new Date().toISOString() };
  } else {
    store.users.push({
      ...user,
      createdAt: user.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  saveStore();
  return findUserById(user.id);
}

// ============================================================================
// DUMP OPERATIONS
// ============================================================================

function getDumps(userId) {
  const store = loadStore();
  if (!userId) return [];
  return store.dumps.filter((d) => d.userId === userId);
}

function findDumpById(id) {
  if (!id) return null;
  const store = loadStore();
  return store.dumps.find((d) => d.id === id) || null;
}

function saveDump(dump) {
  const store = loadStore();
  const existingIdx = store.dumps.findIndex((d) => d.id === dump.id);
  if (existingIdx >= 0) {
    store.dumps[existingIdx] = { ...store.dumps[existingIdx], ...dump, updatedAt: new Date().toISOString() };
  } else {
    store.dumps.unshift({
      ...dump,
      createdAt: dump.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  saveStore();
  return findDumpById(dump.id);
}

function deleteDump(id, userId) {
  const store = loadStore();
  const initialLen = store.dumps.length;
  store.dumps = store.dumps.filter((d) => {
    if (d.id !== id) return true;
    if (userId && d.userId !== userId) return true; // prevent deleting other users' dumps
    return false;
  });
  saveStore();
  return store.dumps.length < initialLen;
}

// ============================================================================
// TASK OPERATIONS (Manual tasks and task statuses)
// ============================================================================

function getTasks(userId) {
  const store = loadStore();
  if (!userId) return [];
  return store.tasks.filter((t) => t.userId === userId);
}

function findTaskById(id) {
  if (!id) return null;
  const store = loadStore();
  return store.tasks.find((t) => t.id === id) || null;
}

function saveTask(task) {
  const store = loadStore();
  const existingIdx = store.tasks.findIndex((t) => t.id === task.id);
  if (existingIdx >= 0) {
    store.tasks[existingIdx] = { ...store.tasks[existingIdx], ...task, updatedAt: new Date().toISOString() };
  } else {
    store.tasks.unshift({
      ...task,
      createdAt: task.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  saveStore();
  return findTaskById(task.id);
}

function updateTask(id, updates, userId) {
  const store = loadStore();
  const task = store.tasks.find((t) => t.id === id && (!userId || t.userId === userId));
  if (!task) return null;
  Object.assign(task, updates, { updatedAt: new Date().toISOString() });
  saveStore();
  return task;
}

function deleteTask(id, userId) {
  const store = loadStore();
  const initialLen = store.tasks.length;
  store.tasks = store.tasks.filter((t) => {
    if (t.id !== id) return true;
    if (userId && t.userId !== userId) return true;
    return false;
  });
  saveStore();
  return store.tasks.length < initialLen;
}

module.exports = {
  loadStore,
  saveStore,
  getUsers,
  findUserById,
  findUserByEmail,
  saveUser,
  getDumps,
  findDumpById,
  saveDump,
  deleteDump,
  getTasks,
  findTaskById,
  saveTask,
  updateTask,
  deleteTask
};
