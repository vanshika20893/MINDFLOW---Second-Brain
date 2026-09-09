const authService = require("../services/auth.service");

/**
 * Handle user login with email & password
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        error: "Email is required to log in."
      });
    }

    const user = await authService.loginUserWithPassword({
      email: email.trim(),
      password: password || ""
    });

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      }
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: error.message || "Failed to log in"
    });
  }
}

/**
 * Handle new user registration / account creation
 */
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: "Please provide your full name."
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        error: "Please provide a valid email address."
      });
    }

    const passwordError = authService.validatePasswordRules(password);
    if (passwordError) {
      return res.status(400).json({
        success: false,
        error: passwordError
      });
    }

    const user = await authService.registerUser({
      name: name.trim(),
      email: email.trim(),
      password: password.trim()
    });

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      }
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: error.message || "Failed to create account"
    });
  }
}

/**
 * Handle user logout
 */
async function logout(req, res) {
  res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
}

/**
 * Get and verify current session user
 */
async function getMe(req, res, next) {
  try {
    const userId = req.headers["x-user-id"] || req.query.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Not authenticated. Missing user ID." });
    }

    const user = await authService.findUserById(userId);
    if (!user) {
      return res.status(401).json({ success: false, error: "Session invalid. User does not exist." });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
  register,
  logout,
  getMe
};
