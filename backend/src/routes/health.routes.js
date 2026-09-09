const express = require("express");
const router = express.Router();

/**
 * GET /api/health
 * Simple health check endpoint to verify that the Express server is up and responsive.
 */
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Brain Dump API is healthy and running",
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
