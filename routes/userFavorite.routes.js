const express = require("express");
const router = express.Router();
const {
  addFavoriteProduct,
  getAllFavoriteProducts,
  deleteFavoriteProduct,
} = require("../controllers/userFavorite.controller");

router.route("/").post(addFavoriteProduct);
router.route("/").get(getAllFavoriteProducts);
router.route("/:product_id").delete(deleteFavoriteProduct);
module.exports = router;
