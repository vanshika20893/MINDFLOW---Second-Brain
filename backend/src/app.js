const express = require("express");
const cors = require("cors");
const healthRoutes = require("./routes/health.routes");
const dumpsRoutes = require("./routes/dumps.routes");
const authRoutes = require("./routes/auth.routes");
const tasksRoutes = require("./routes/tasks.routes");

const app = express();

// 1. Cross-Origin Resource Sharing (CORS)
// Allows our Next.js frontend (running on http://localhost:3000) to communicate with this backend.
app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true
}));

// 2. Built-in JSON Body Parser
// Parses incoming requests with JSON payloads (e.g. { "content": "My thought" }) and makes it available under req.body.
app.use(express.json());

// 3. Mount Routes
app.use("/api", healthRoutes);
app.use("/api", dumpsRoutes);
app.use("/api", authRoutes);
app.use("/api", tasksRoutes);

// 4. Handle 404 Not Found for undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    error: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// 5. Centralized Error Handling Middleware
// Whenever a controller calls next(err) or an unhandled exception occurs, this middleware handles it.
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || "Internal Server Error"
  });
});

module.exports = app;
