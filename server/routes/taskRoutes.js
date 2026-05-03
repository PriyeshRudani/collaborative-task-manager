const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const {
  createTask,
  getTasks,
  getTaskStats,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

router.get("/", auth, getTasks);
router.get("/stats", auth, getTaskStats);
router.post("/", auth, createTask);
router.put("/:id", auth, updateTask);
router.delete("/:id", auth, deleteTask);

module.exports = router;
