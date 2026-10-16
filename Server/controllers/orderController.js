const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Orders = require("../models/Orders");

// POST /api/orders/checkout  { shippingAddress }
// Converts the current user's cart into an order, deducts stock, clears cart.
exports.checkout = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { shippingAddress } = req.body;
    if (!shippingAddress) {
      return res.status(400).json({ message: "shippingAddress is required." });
    }

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty." });
    }

    let orderItems = [];
    let totalAmount = 0;

    session.startTransaction();

    for (const item of cart.items) {
      const product = await Product.findById(item.productId).session(session);
      if (!product || !product.isActive) {
        throw new Error(`Product no longer available: ${item.productId}`);
      }
      const variant = product.variants.id(item.variantId);
      if (!variant) {
        throw new Error(`Variant no longer available for ${product.name}`);
      }
      if (variant.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name} (${variant.sku})`);
      }

      variant.stock -= item.quantity;
      await product.save({ session });

      orderItems.push({
        productId: product._id,
        variantId: variant._id,
        productName: product.name,
        variantSku: variant.sku,
        quantity: item.quantity,
        priceAtPurchase: variant.price,
      });
      totalAmount += variant.price * item.quantity;
    }

    const [order] = await Orders.create(
      [
        {
          userId: req.user.id,
          items: orderItems,
          totalAmount,
          shippingAddress,
          status: "pending",
        },
      ],
      { session }
    );

    cart.items = [];
    await cart.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(order);
  } catch (err) {
    await session.abortTransaction().catch(() => {});
    session.endSession();
    res.status(400).json({ message: "Checkout failed.", error: err.message });
  }
};

// GET /api/orders/mine
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Orders.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders.", error: err.message });
  }
};

// GET /api/orders  (admin: all orders)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Orders.find().populate("userId", "username email").sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders.", error: err.message });
  }
};

// PUT /api/orders/:id/status  (admin: update order status)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${allowed.join(", ")}` });
    }
    const order = await Orders.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: "Order not found." });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Failed to update order.", error: err.message });
  }
};
