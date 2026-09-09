const express = require("express");
const router = express.Router();
const dumpsController = require("../controllers/dumps.controller");

/**
 * Route definitions for Brain Dumps:
 * - POST /api/dumps       -> Save a new dump
 * - GET  /api/dumps       -> Retrieve all dumps
 * - GET  /api/dumps/:id   -> Retrieve a specific dump
 */
router.post("/dumps", dumpsController.createDump);
router.get("/dumps", dumpsController.getDumps);
router.get("/dumps/:id", dumpsController.getDumpById);
router.delete("/dumps/:id", dumpsController.deleteDump);

module.exports = router;
