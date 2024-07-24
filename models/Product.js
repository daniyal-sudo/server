const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: String,
  color: [String],
  weight: String,
  catalog_type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Catalog' }],
  images: [String],
  price: String,
  description:String,
});

const ProductModel = mongoose.model("products", ProductSchema);
module.exports = ProductModel;
