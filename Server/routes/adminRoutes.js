const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const adminController = require("../controllers/adminController");

const router = express.Router();

// All routes below require a logged-in admin
router.use(authMiddleware, adminMiddleware);

router.get("/config", adminController.getConfig);
router.put("/config", adminController.updateConfig);
router.get("/users", adminController.getUsers);
router.put("/users/:id/role", adminController.setUserRole);

module.exports = router;
