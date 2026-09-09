const prisma = require("../db");
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
 * Remove sensitive credentials from user object before sending to client
 */
function sanitizeUser(user) {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
}

/**
 * Password Rules Validator
 */
function validatePasswordRules(password) {
  if (!password || typeof password !== "string") {
    return "Password is required.";
  }
  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter (A-Z).";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number (0-9).";
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return "Password must contain at least one special character (e.g. !@#$%^&*).";
  }
  return null;
}

/**
 * Find user by email (returns raw user object including password for verification)
 */
async function findUserByEmail(email) {
  if (!email) return null;
  const cleanEmail = email.trim().toLowerCase();
  const isDbAvailable = await checkDatabaseConnection();

  if (isDbAvailable) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: cleanEmail }
      });
      if (user) return user;
    } catch (err) {
      console.warn("Prisma findUnique failed, using file store:", err.message);
    }
  }

  return fileStore.findUserByEmail(cleanEmail);
}

/**
 * Find user by ID
 */
async function findUserById(id) {
  if (!id) return null;
  const isDbAvailable = await checkDatabaseConnection();

  if (isDbAvailable) {
    try {
      const user = await prisma.user.findUnique({
        where: { id }
      });
      if (user) return user;
    } catch (err) {
      console.warn("Prisma findUniqueById failed, using file store:", err.message);
    }
  }

  return fileStore.findUserById(id);
}

/**
 * Register a new user with stable user ID
 */
async function registerUser({ name, email, password }) {
  const cleanEmail = (email || "").trim().toLowerCase();
  const cleanName = (name || "").trim();

  const passwordError = validatePasswordRules(password);
  if (passwordError) {
    const error = new Error(passwordError);
    error.statusCode = 400;
    throw error;
  }

  const existing = await findUserByEmail(cleanEmail);
  if (existing) {
    const error = new Error("An account with this email already exists. Please log in.");
    error.statusCode = 409;
    throw error;
  }

  // Stable ID format
  const userId = `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const isDbAvailable = await checkDatabaseConnection();

  if (isDbAvailable) {
    try {
      const newUser = await prisma.user.create({
        data: {
          id: userId,
          name: cleanName,
          email: cleanEmail,
          password
        }
      });
      return sanitizeUser(newUser);
    } catch (err) {
      console.warn("Prisma user creation failed, falling back to file store:", err.message);
    }
  }

  const newUser = {
    id: userId,
    name: cleanName,
    email: cleanEmail,
    password,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  fileStore.saveUser(newUser);
  return sanitizeUser(newUser);
}

/**
 * Log in an existing user: validates credentials and returns existing stable user
 */
async function loginUserWithPassword({ email, password }) {
  const cleanEmail = (email || "").trim().toLowerCase();
  const user = await findUserByEmail(cleanEmail);

  if (!user) {
    const error = new Error("No account found with this email. Please create an ID first.");
    error.statusCode = 404;
    throw error;
  }

  if (user.password && user.password !== password) {
    const error = new Error("Incorrect password. Please verify and try again.");
    error.statusCode = 401;
    throw error;
  }

  return sanitizeUser(user);
}

module.exports = {
  findUserByEmail,
  findUserById,
  registerUser,
  loginUserWithPassword,
  validatePasswordRules,
  sanitizeUser
};
