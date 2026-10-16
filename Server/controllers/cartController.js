const mongoose = require("mongoose");
const Product = require("../models/Product");
const Cart = require("../models/Cart");

async function buildCartResponse(cart) {
  // Populate product info for each item so the frontend can render names/prices
  const populated = await Cart.findById(cart._id).populate("items.productId");
  const items = populated.items.map((item) => {
    const product = item.productId;
    const variant = product ? product.variants.id(item.variantId) : null;
    return {
      productId: product ? product._id : item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      productName: product ? product.name : "Unknown product",
      image: variant ? variant.image || product.image : null,
      sku: variant ? variant.sku : null,
      price: variant ? variant.price : null,
      stock: variant ? variant.stock : null,
      subtotal: variant ? variant.price * item.quantity : null,
    };
  });
  const total = items.reduce((sum, i) => sum + (i.subtotal || 0), 0);
  return { _id: populated._id, userId: populated.userId, items, total };
}

// GET /api/cart
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      cart = await Cart.create({ userId: req.user.id, items: [] });
    }
    res.json(await buildCartResponse(cart));
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch cart.", error: err.message });
  }
};

// POST /api/cart/add
exports.addToCart = async (req, res) => {
  try {
    const { productId, variantId, quantity } = req.body;
    const qty = Number.isInteger(quantity) ? quantity : parseInt(quantity, 10) || 1;

    if (!productId || !variantId) {
      return res.status(400).json({ message: "productId and variantId are required." });
    }
    if (!Number.isInteger(qty) || qty <= 0) {
      return res.status(400).json({ message: "quantity must be a positive integer." });
    }
    if (
      !mongoose.Types.ObjectId.isValid(productId) ||
      !mongoose.Types.ObjectId.isValid(variantId)
    ) {
      return res.status(400).json({ message: "Invalid productId or variantId." });
    }

    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) return res.status(404).json({ message: "Product not found or inactive." });

    const variant = product.variants.id(variantId);
    if (!variant) return res.status(404).json({ message: "Variant not found." });

    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [] });
    }

    const existingItem = cart.items.find(
      (i) => i.productId.toString() === productId && i.variantId.toString() === variantId
    );

    const requestedTotal = (existingItem ? existingItem.quantity : 0) + qty;
    if (requestedTotal > variant.stock) {
      return res.status(400).json({
        message: `Only ${variant.stock} unit(s) of this variant are in stock.`,
      });
    }

    if (existingItem) {
      existingItem.quantity = requestedTotal;
    } else {
      cart.items.push({ productId, variantId, quantity: qty });
    }

    await cart.save();
    res.json(await buildCartResponse(cart));
  } catch (err) {
    res.status(500).json({ message: "Failed to add item to cart.", error: err.message });
  }
};

// PUT /api/cart/update  { productId, variantId, quantity }
exports.updateCartItem = async (req, res) => {
  try {
    const { productId, variantId, quantity } = req.body;
    const qty = parseInt(quantity, 10);

    if (!productId || !variantId || !Number.isInteger(qty) || qty <= 0) {
      return res.status(400).json({
        message: "productId, variantId and a positive integer quantity are required.",
      });
    }

    const product = await Product.findById(productId);
    const variant = product ? product.variants.id(variantId) : null;
    if (!variant) return res.status(404).json({ message: "Product or variant not found." });
    if (qty > variant.stock) {
      return res.status(400).json({ message: `Only ${variant.stock} unit(s) in stock.` });
    }

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found." });

    const item = cart.items.find(
      (i) => i.productId.toString() === productId && i.variantId.toString() === variantId
    );
    if (!item) return res.status(404).json({ message: "Item not in cart." });

    item.quantity = qty;
    await cart.save();
    res.json(await buildCartResponse(cart));
  } catch (err) {
    res.status(500).json({ message: "Failed to update cart item.", error: err.message });
  }
};

// DELETE /api/cart/remove  { productId, variantId }
exports.removeCartItem = async (req, res) => {
  try {
    const { productId, variantId } = req.body;
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found." });

    cart.items = cart.items.filter(
      (i) => !(i.productId.toString() === productId && i.variantId.toString() === variantId)
    );

    await cart.save();
    res.json(await buildCartResponse(cart));
  } catch (err) {
    res.status(500).json({ message: "Failed to remove cart item.", error: err.message });
  }
};

// DELETE /api/cart/clear
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found." });
    cart.items = [];
    await cart.save();
    res.json(await buildCartResponse(cart));
  } catch (err) {
    res.status(500).json({ message: "Failed to clear cart.", error: err.message });
  }
};
