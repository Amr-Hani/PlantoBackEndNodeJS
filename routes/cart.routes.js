const express = require("express");
const router = express.Router();
const {
  addItemToCart,
  getCartById,
  deleteItemFromCart,
  updateCart,
  updateItemQuantityFromCart,
  stripeCheckout,
  clearCart,
} = require("../controllers/cart.controller");
const {
  verifyToken,
  isTokenBlackListed,
} = require("../middlewares/verifyToken.js");

const {
  AddTocartMiddleware,
  DeleteItemFromCartMiddleware,
  UpdateCartMiddleware,
} = require("../middlewares/cartMiddleware");
router
  .route("/")
  .post(isTokenBlackListed, AddTocartMiddleware(), addItemToCart);
router
  .route("/updatecartItemQuantity")
  .post(isTokenBlackListed, AddTocartMiddleware(), updateItemQuantityFromCart); // will take the new value of quantity in the cart itself
router.route("/").get(isTokenBlackListed, getCartById);
router.route("/:product_id").delete(isTokenBlackListed, deleteItemFromCart);
router.route("/").delete(clearCart);
router.route("/").put(isTokenBlackListed, UpdateCartMiddleware(), updateCart);
router.route("/checkout").post(isTokenBlackListed, stripeCheckout);

module.exports = router;
