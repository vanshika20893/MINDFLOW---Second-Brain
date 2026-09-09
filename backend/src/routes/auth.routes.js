const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

// POST /api/auth/login -> Log in existing user
router.post("/auth/login", authController.login);

// POST /api/auth/register -> Create new account
router.post("/auth/register", authController.register);

// POST /api/auth/logout -> Log out
router.post("/auth/logout", authController.logout);

// GET /api/auth/me -> Current user session
router.get("/auth/me", authController.getMe);

module.exports = router;
