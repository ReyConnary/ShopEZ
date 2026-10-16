const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const cartController = require("../controllers/cartController");

const router = express.Router();

router.get("/", authMiddleware, cartController.getCart);
router.post("/add", authMiddleware, cartController.addToCart);
router.put("/update", authMiddleware, cartController.updateCartItem);
router.delete("/remove", authMiddleware, cartController.removeCartItem);
router.delete("/clear", authMiddleware, cartController.clearCart);

module.exports = router;
