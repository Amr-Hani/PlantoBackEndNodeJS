const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/verifyToken.js");
const {
  addFavoriteProduct,
  getAllFavoriteProducts,
  deleteFavoriteProduct,
} = require("../controllers/userFavorite.controller");

router.route("/").post(verifyToken, addFavoriteProduct);
router.route("/").get(verifyToken, getAllFavoriteProducts);
router.route("/:product_id").delete(verifyToken, deleteFavoriteProduct);
module.exports = router;
