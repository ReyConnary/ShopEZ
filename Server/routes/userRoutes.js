const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const userController = require("../controllers/userController");

const router = express.Router();

router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/logout", authMiddleware, userController.logout);
router.get("/me", authMiddleware, userController.getMe);
router.put("/me", authMiddleware, userController.updateMe);

module.exports = router;
