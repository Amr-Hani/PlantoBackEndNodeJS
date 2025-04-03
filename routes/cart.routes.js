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
  AddTocartMiddleware,
  DeleteItemFromCartMiddleware,
  UpdateCartMiddleware,
} = require("../middlewares/cartMiddleware");
router.route("/").post(AddTocartMiddleware(), addItemToCart);
router
  .route("/updatecartItemQuantity")
  .post(AddTocartMiddleware(), updateItemQuantityFromCart); // will take the new value of quantity in the cart itself
router.route("/").get(getCartById);
router.route("/:product_id").delete(deleteItemFromCart);
router.route("/").delete(clearCart);
router.route("/").put(UpdateCartMiddleware(), updateCart);
router.route("/checkout").post(stripeCheckout);

module.exports = router;
