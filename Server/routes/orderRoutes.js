const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const orderController = require("../controllers/orderController");

const router = express.Router();

router.post("/checkout", authMiddleware, orderController.checkout);
router.get("/mine", authMiddleware, orderController.getMyOrders);
router.get("/", authMiddleware, adminMiddleware, orderController.getAllOrders);
router.put("/:id/status", authMiddleware, adminMiddleware, orderController.updateOrderStatus);

module.exports = router;
