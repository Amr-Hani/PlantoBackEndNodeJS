const express = require("express");
const router = express.Router();
const {
  addItemToCart,
  getCartById,
  deleteItemFromCart,
  updateCart,
} = require("../controllers/cart.controller");

const cartMiddleware = require("../middlewares/cartMiddleware");
router.route("/").post(cartMiddleware(), addItemToCart);
router.route("/").get(getCartById);
router.route("/").delete(cartMiddleware(), deleteItemFromCart);
router.route("/").patch(updateCart);
module.exports = router;
