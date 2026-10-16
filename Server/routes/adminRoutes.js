const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const adminController = require("../controllers/adminController");

const router = express.Router();

// Public: anyone (including guests) can read the storefront banner and
// category list — this is what the Landing page and Products filter use.
router.get("/public-config", adminController.getPublicConfig);

// Everything below requires a logged-in admin.
router.get("/config", authMiddleware, adminMiddleware, adminController.getConfig);
router.put("/config", authMiddleware, adminMiddleware, adminController.updateConfig);
router.get("/users", authMiddleware, adminMiddleware, adminController.getUsers);
router.put("/users/:id/role", authMiddleware, adminMiddleware, adminController.setUserRole);

module.exports = router;
