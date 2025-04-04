const express = require("express");
const router = express.Router();
const {
  addFavoriteProduct,
  getAllFavoriteProducts,
  deleteFavoriteProduct,
} = require("../controllers/userFavorite.controller");

const { isTokenBlackListed } = require("../middlewares/verifyToken.js");

router.route("/").post(isTokenBlackListed, addFavoriteProduct);
router.route("/").get(isTokenBlackListed, getAllFavoriteProducts);
router.route("/:product_id").delete(isTokenBlackListed, deleteFavoriteProduct);
module.exports = router;
