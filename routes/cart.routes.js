const express = require("express");
const router = express.Router();
const {
  addItemToCart,
  getCartById,
  deleteItemFromCart,
  updateCart,
} = require("../controllers/cart.controller");

router.route("/").post(addItemToCart);
router.route("/").get(getCartById);
router.route("/").delete(deleteItemFromCart);
router.route("/").patch(updateCart);
module.exports = router;
