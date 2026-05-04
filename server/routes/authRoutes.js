const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const {
  registerUser,
  loginUser,
  getUsers,
  getMe,
} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/users", auth, getUsers);
router.get("/me", auth, getMe);

module.exports = router;
