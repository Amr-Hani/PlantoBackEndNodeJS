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
  //const product_id = req.body.product_id; // sami dol tani da test bardo
  // const quantity = req.body.quantity || 1;
  const requestFields = Object.keys(req.body);
  const allowedFields = [
    "product_id",
    "quantity",
    "size",
    "color",
    "priceAtPurchase",
  ];
  const { product_id, quantity = 1, color, size, priceAtPurchase } = req.body;
  const invalidFields = requestFields.filter(
    (field) => !allowedFields.includes(field)
  );
  if (requestFields.length === 0) {
    const error = AppError.createError(
      "Please provide at least one valid field to update",
      400,
      status.BAD_REQUEST
    );
    return next(error);
  }

  if (invalidFields.length > 0) {
    const error = AppError.createError(
      `Invalid fields:( ${invalidFields.join(
        ", "
      )} ) Allowed fields: (${allowedFields.join(", ")})`,
      400,
      status.BAD_REQUEST
    );
    return next(error);
  }
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
  // now check if their a product with the selected color not the stock or not
  const stockItemWithSepecific_Color = product.stock.find(
    (item) => item.color === color
  );
  if (!stockItemWithSepecific_Color) {
    return next(
      AppError.createError(
        "Invalid color for this product",
        400,
        status.BAD_REQUEST
      )
    );
  }
  console.log(stockItemWithSepecific_Color);
  // now check on the stockItemWithSepecific_Color if it have a size like the requested
  const stockItemWithSepecific_ColorAndSize =
    stockItemWithSepecific_Color.sizes.find((s) => s.size === size);
  if (!stockItemWithSepecific_ColorAndSize) {
    return next(
      AppError.createError(
        "Invalid size for this product",
        400,
        status.BAD_REQUEST
      )
    );
  }
  console.log(stockItemWithSepecific_ColorAndSize);
  // now check on the quantitiy
  if (quantity > stockItemWithSepecific_ColorAndSize.quantity) {
    return next(
      AppError.createError(
        "Requested quantity exceeds available stock",
        400,
        status.BAD_REQUEST
      )
    );
  }
  // kda 5allat el checks >> e3ml cart b2a aw def 3al existing
  let cart = await Cart.findOne({ userId });

  if (!cart) {
    // kda ha3ml cart gdeda w hadef el product bel quantity elli mb3ota
    cart = new Cart({
      userId,
      cartItems: [{ product_id, quantity, color, size, priceAtPurchase }],
    });
  } else {
    // hashof el item da fel cart abl kda walla la2
    const existingItem = cart.cartItems.find(
      (item) =>
        item.product_id.equals(product_id) &&
        item.color === color &&
        item.size === size
    );

    if (existingItem) {
      existingItem.quantity += quantity; // msh += 1 ya 3la2 -_-
    } else {
      cart.cartItems.push({
        product_id,
        quantity,
        color,
        size,
        priceAtPurchase,
      }); // Add new product
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

  const requestFields = Object.keys(req.body);
  const allowedFields = ["product_id", "size", "color"];
  const { product_id, color, size } = req.body;
  // now start chechikg on the request fields
  const invalidFields = requestFields.filter(
    (field) => !allowedFields.includes(field)
  );
  if (requestFields.length === 0) {
    const error = AppError.createError(
      "Please provide at least one valid field to update",
      400,
      status.BAD_REQUEST
    );
    return next(error);
  }

  if (invalidFields.length > 0) {
    const error = AppError.createError(
      `Invalid fields:( ${invalidFields.join(
        ", "
      )} ) Allowed fields: (${allowedFields.join(", ")})`,
      400,
      status.BAD_REQUEST
    );
    return next(error);
  }
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
  // now i have finished cart checking >> lets do the cart checking
  let cart = await Cart.findOne({ userId });

  if (!cart) {
    const error = AppError.createError("Cart Not Found", 404, status.NOT_FOUND);
    return next(error);
  }
  const existingItem = cart.cartItems.find(
    (item) =>
      item.product_id.equals(product_id) &&
      item.color === color &&
      item.size === size
  );

  // case en el element da (bel id wel size wel color) msh mwgod fel Cart
  if (!existingItem) {
    return next(
      AppError.createError("Item isn't found in cart", 404, status.NOT_FOUND)
    );
  }
  // case en el element da mwgod fe3lan .. hmsa7o b2a
  cart.cartItems = cart.cartItems.filter(
    (item) =>
      !(
        item.product_id.equals(product_id) &&
        item.color === color &&
        item.size === size
      ) // leh 3mlt keda .. 3shan lw 3ndi 2 item b nafs el id bs different size and color
  );

  await cart.save();
  res.json({ message: "Product removed from cart", cart });
});

//======================Update Cart===================================================

const updateCart = aysncWrapper(async (req, res, next) => {});

//====================================================================================
module.exports = { addItemToCart, getCartById, deleteItemFromCart, updateCart };
