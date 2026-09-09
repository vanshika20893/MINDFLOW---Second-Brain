const express = require("express");
const router = express.Router();
const tasksController = require("../controllers/tasks.controller");

router.get("/tasks", tasksController.getTasks);
router.post("/tasks", tasksController.createTask);
router.patch("/tasks/:id", tasksController.updateTask);
router.delete("/tasks/:id", tasksController.deleteTask);

module.exports = router;
