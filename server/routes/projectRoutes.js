const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const {
  createProject,
  getProjects,
  addMember,
} = require("../controllers/projectController");

router.get("/", auth, getProjects);
router.post("/", auth, createProject);
router.post("/:id/members", auth, addMember);

module.exports = router;
