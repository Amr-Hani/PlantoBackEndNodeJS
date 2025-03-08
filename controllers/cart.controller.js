const aysncWrapper = require("../middlewares/errorHandler.js");
const status = require("../utils/httpStatusText.js");
const AppError = require("../utils/appErrors.js");
const bcrypt = require("bcryptjs");
const UserFavorites = require("../models/userFavorites.model");
const jwt = require("jsonwebtoken");
const Product = require("../models/product.model.js");
const Cart = require("../models/cart.model.js");

//===============decode token to get user Id =====================
const getUserIdFromToken = (req) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Extract token
    console.log(req.headers.authorization);
    if (!token) return "mwlsh token";

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    return decoded.id; // Ensure JWT contains { userId: "..." }  ezay a3raf aeh elli mwgod hena
  } catch (error) {
    console.error("Invalid token:", error);
    return "7ssal moshkella fel decoding";
  }
};

//======================add Product to cart===========================================

const addItemToCart = aysncWrapper(async (req, res, next) => {});

//======================Get cart By Id================================================

const getCartById = aysncWrapper(async (req, res, next) => {});

//======================Delete Item Fom Cart==========================================

const deleteItemFromCart = aysncWrapper(async (req, res, next) => {});

//======================Update Cart===================================================

const updateCart = aysncWrapper(async (req, res, next) => {});

//====================================================================================
module.exports = { addItemToCart, getCartById, deleteItemFromCart, updateCart };
