const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const {
  createTask,
  getTasks,
  getTaskStats,
  updateTask,
  deleteTask,
  addComment,
  toggleSubtask,
} = require("../controllers/taskController");

router.get("/", auth, getTasks);
router.get("/stats", auth, getTaskStats);
router.post("/", auth, createTask);
router.put("/:id", auth, updateTask);
router.post("/:id/comments", auth, addComment);
router.put("/:id/subtasks/:subtaskId", auth, toggleSubtask);
router.delete("/:id", auth, deleteTask);

module.exports = router;
