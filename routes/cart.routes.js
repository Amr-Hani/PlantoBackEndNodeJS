const express = require("express");
const router = express.Router();
const {
  addItemToCart,
  getCartById,
  deleteItemFromCart,
  updateCart,
} = require("../controllers/cart.controller");

const {
  AddTocartMiddleware,
  DeleteItemFromCartMiddleware,
  UpdateCartMiddleware,
} = require("../middlewares/cartMiddleware");
router.route("/").post(AddTocartMiddleware(), addItemToCart);
router.route("/").get(getCartById);
router.route("/:product_id").delete(deleteItemFromCart);
router.route("/").put(UpdateCartMiddleware(), updateCart);
module.exports = router;
