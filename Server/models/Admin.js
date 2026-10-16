const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    categories: { type: [String], default: [] },
    banner: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admin", adminSchema);
