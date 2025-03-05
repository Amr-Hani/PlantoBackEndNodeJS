const mongoose = require("mongoose");

const userFavoritesSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  favoriteProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }], // array of fav products
});

module.exports = mongoose.model("UserFavorites", userFavoritesSchema);
