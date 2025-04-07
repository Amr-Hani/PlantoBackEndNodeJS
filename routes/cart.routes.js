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
  updateStockAfterSuccessPurchase,
} = require("../controllers/cart.controller");
const { verifyToken } = require("../middlewares/verifyToken.js");

const {
  AddTocartMiddleware,
  DeleteItemFromCartMiddleware,
  UpdateCartMiddleware,
} = require("../middlewares/cartMiddleware");
router.route("/").post(verifyToken, AddTocartMiddleware(), addItemToCart);
router
  .route("/updatecartItemQuantity")
  .post(verifyToken, AddTocartMiddleware(), updateItemQuantityFromCart); // will take the new value of quantity in the cart itself
router.route("/").get(verifyToken, getCartById);
router.route("/:product_id").delete(verifyToken, deleteItemFromCart);
router.route("/").delete(verifyToken, clearCart);
router.route("/").put(verifyToken, UpdateCartMiddleware(), updateCart);
router.route("/checkout").post(verifyToken, stripeCheckout);
router
  .route("/subtractStock")
  .post(verifyToken, updateStockAfterSuccessPurchase);

module.exports = router;
