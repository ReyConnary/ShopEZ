const Admin = require("../models/Admin");
const User = require("../models/User");

// GET /api/admin/public-config  (public — no auth; storefront reads this
// for the banner and category filter, so it must be reachable by guests too)
exports.getPublicConfig = async (req, res) => {
  try {
    let config = await Admin.findOne();
    if (!config) config = await Admin.create({ categories: [], banner: "" });
    res.json({ categories: config.categories, banner: config.banner });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch store settings.", error: err.message });
  }
};

// GET /api/admin/config  (admin only — same data, used by the Admin Settings form)
exports.getConfig = async (req, res) => {
  try {
    let config = await Admin.findOne();
    if (!config) config = await Admin.create({ categories: [], banner: "" });
    res.json(config);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch admin config.", error: err.message });
  }
};

// PUT /api/admin/config  { categories?, banner? }
exports.updateConfig = async (req, res) => {
  try {
    const { categories, banner } = req.body;
    let config = await Admin.findOne();
    if (!config) config = new Admin();
    if (categories) config.categories = categories;
    if (banner !== undefined) config.banner = banner;
    await config.save();
    res.json(config);
  } catch (err) {
    res.status(500).json({ message: "Failed to update admin config.", error: err.message });
  }
};

// GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users.", error: err.message });
  }
};

// PUT /api/admin/users/:id/role  { role: "admin" | "user" }
exports.setUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "role must be 'user' or 'admin'." });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select(
      "-password"
    );
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to update role.", error: err.message });
  }
};
