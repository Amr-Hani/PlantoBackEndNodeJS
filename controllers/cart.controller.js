const aysncWrapper = require("../middlewares/errorHandler.js");
const status = require("../utils/httpStatusText.js");
const AppError = require("../utils/appErrors.js");
const bcrypt = require("bcryptjs");
const UserFavorites = require("../models/userFavorites.model");
const jwt = require("jsonwebtoken");
const Product = require("../models/product.model.js");
const Cart = require("../models/cart.model.js");
const { validationResult } = require("express-validator");

//===============decode token to get user Id =====================
const getUserIdFromToken = (req) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Extract token
    console.log(req.headers.authorization);
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    return decoded.id; // Ensure JWT contains { userId: "..." }  ezay a3raf aeh elli mwgod hena
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
};

//======================add Product to cart===========================================

const addItemToCart = aysncWrapper(async (req, res, next) => {
  const userId = getUserIdFromToken(req);
  const product_id = req.body.product_id; // sami dol tani da test bardo
  const quantity = req.body.quantity || 1;
  const requestFields = Object.keys(req.body);
  const allowedFields = ["product_id", "quantity"];
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = AppError.createError(errors.array(), 400, status.BAD_REQUEST);
    return next(error);
  }

  if (!userId) {
    const error = AppError.createError(
      "Unauthorized",
      401,
      status.UNAUTHORIZED
    );
    return next(error);
  }

  // now check if ther is a product with this id or not
  let product = await Product.findOne({ _id: product_id });
  console.log(product);

  if (!product) {
    const error = AppError.createError(
      "no prodouct with this id",
      404,
      status.NOT_FOUND
    );
    return next(error);
  }
  // kda 5allat el checks >> e3ml cart b2a aw def 3al existing
  let cart = await Cart.findOne({ userId });

  if (!cart) {
    // kda ha3ml cart gdeda w hadef el product bel quantity elli mb3ota
    cart = new Cart({ userId, cartItems: [{ product_id, quantity }] });
  } else {
    // hashof el item da fel cart abl kda walla la2
    const existingItem = cart.cartItems.find((item) =>
      item.product_id.equals(product_id)
    );

    if (existingItem) {
      existingItem.quantity += quantity; // msh += 1 ya 3la2 -_-
    } else {
      cart.cartItems.push({ product_id, quantity }); // Add new product
    }
  }

  await cart.save();
  res.json({ message: "Cart updated successfully", data: cart });
});

//======================Get cart By Id================================================

const getCartById = aysncWrapper(async (req, res, next) => {
  const userId = getUserIdFromToken(req);
  if (!userId) {
    const error = AppError.createError(
      "Unauthorized",
      401,
      status.UNAUTHORIZED
    );
    return next(error);
  }

  const cart = await Cart.findOne({ userId }).populate("cartItems.product_id");
  if (cart.cartItems.length == 0) {
    return res
      .status(200)
      .json({ message: "Cart is Empty", data: cart.cartItems });
  }

  res.json(cart);
});

//======================Delete Item Fom Cart==========================================

const deleteItemFromCart = aysncWrapper(async (req, res, next) => {
  const userId = getUserIdFromToken(req);
  const product_id = req.body.product_id;

  if (!userId) {
    const error = AppError.createError(
      "Unauthorized",
      401,
      status.UNAUTHORIZED
    );
    return next(error);
  }

  let cart = await Cart.findOne({ userId });

  if (!cart) {
    const error = AppError.createError("Cart Not Found", 404, status.NOT_FOUND);
    return next(error);
  }
  cart.cartItems = cart.cartItems.filter(
    (item) => !item.product_id.equals(product_id)
  );

  await cart.save();
  res.json({ message: "Product removed from cart", cart });
});

//======================Update Cart===================================================

const updateCart = aysncWrapper(async (req, res, next) => {});

//====================================================================================
module.exports = { addItemToCart, getCartById, deleteItemFromCart, updateCart };
