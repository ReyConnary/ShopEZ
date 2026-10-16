const mongoose = require("mongoose");
const Product = require("../models/Product");

// GET /api/products  (public, active only, optional ?category=&search=)
exports.getProducts = async (req, res) => {
  try {
    const { category, search, all } = req.query;
    // ?all=true returns inactive products too (used by the Admin product
    // table so deactivated products stay visible/reactivatable). The public
    // storefront never sends this, so it still only sees active products.
    const filter = all === "true" ? {} : { isActive: true };
    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: "i" };

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products.", error: err.message });
  }
};

// GET /api/products/:id
exports.getProductById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid product id." });
    }
    const product = await Product.findOne({ _id: req.params.id, isActive: true });
    if (!product) return res.status(404).json({ message: "Product not found." });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch product.", error: err.message });
  }
};

// POST /api/products  (admin only)
exports.createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: "Validation failed.", error: err.message });
    }
    res.status(500).json({ message: "Failed to create product.", error: err.message });
  }
};

// PUT /api/products/:id  (admin only)
exports.updateProduct = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid product id." });
    }
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: "Product not found." });
    res.json(product);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: "Validation failed.", error: err.message });
    }
    res.status(500).json({ message: "Failed to update product.", error: err.message });
  }
};

// DELETE /api/products/:id  (admin only, soft delete)
exports.deactivateProduct = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid product id." });
    }
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: "Product not found." });
    res.json({ message: "Product deactivated.", product });
  } catch (err) {
    res.status(500).json({ message: "Failed to deactivate product.", error: err.message });
  }
};

// PUT /api/products/:id/reactivate  (admin only)
exports.reactivateProduct = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid product id." });
    }
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: "Product not found." });
    res.json({ message: "Product reactivated.", product });
  } catch (err) {
    res.status(500).json({ message: "Failed to reactivate product.", error: err.message });
  }
};
