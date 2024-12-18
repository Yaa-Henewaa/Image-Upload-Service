const mongoose = require("mongoose");

const ImageSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  url: { type: String, required: true },
  application: { type: String, default: "blog-app" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Image", ImageSchema);
