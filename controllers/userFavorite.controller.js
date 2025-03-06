const aysncWrapper = require("../middlewares/errorHandler.js");
const status = require("../utils/httpStatusText.js");
const AppError = require("../utils/appErrors.js");
const bcrypt = require("bcryptjs");
const UserFavorites = require("../models/userFavorites.model");
const jwt = require("jsonwebtoken");
const Product = require("../models/product.model.js");

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
//======================add Fav Product==========================================
const addFavoriteProduct = aysncWrapper(async (req, res, next) => {
  const userId = getUserIdFromToken(req);
  const product_id = req.body.product_id; // sami dol tani da test bardo
  const requestFields = Object.keys(req.body);
  const allowedFields = ["product_id"];

  const invalidFields = requestFields.filter(
    (field) => !allowedFields.includes(field)
  );

  if (invalidFields.length > 0) {
    const error = AppError.createError(
      `Invalid field names. Allowed fields are: ${allowedFields.join(",")}`,
      400,
      status.BAD_REQUEST
    );
    return next(error);
  }

  if (!userId || !product_id) {
    const error = AppError.createError(
      "User ID and Product ID are required",
      400,
      status.BAD_REQUEST
    );
    return next(error);
  }
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
  let userFavorites = await UserFavorites.findOne({ userId }); // if the user already have an userFavourite

  if (!userFavorites) {
    // case en m3ndosh
    userFavorites = new UserFavorites({
      userId: userId,
      favoriteProducts: [product_id],
    });
  } else {
    if (!userFavorites.favoriteProducts.includes(product_id)) {
      userFavorites.favoriteProducts.push(product_id);
    } else {
      return res.status(400).json({ message: "product already in favorites" });
    }
  }

  await userFavorites.save();
  res.status(200).json({
    message: "product added sucssfully to favorites",
    data: userFavorites,
  });
});
//======================Get All Fav Product==========================================
const getAllFavoriteProducts = aysncWrapper(async (req, res, next) => {
  const userId = getUserIdFromToken(req);

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  const userFavorites = await UserFavorites.findOne({ userId }).populate(
    "favoriteProducts"
  );

  if (!userFavorites) {
    return res
      .status(200)
      .json({ message: "No favorite products found", data: [] });
  }

  res.status(200).json({
    message: "User's favorite products",
    data: userFavorites.favoriteProducts,
  });
});
//======================Delete Fav Product==========================================
const deleteFavoriteProduct = async (req, res, next) => {
  const userId = getUserIdFromToken(req);

  const product_id = req.body.product_id; // sami dol tani da test bardo
  const requestFields = Object.keys(req.body);
  const allowedFields = ["product_id"];

  const invalidFields = requestFields.filter(
    (field) => !allowedFields.includes(field)
  );

  if (invalidFields.length > 0) {
    const error = AppError.createError(
      `Invalid field names. Allowed fields are: ${allowedFields.join(",")}`,
      400,
      status.BAD_REQUEST
    );
    return next(error);
  }
  if (!userId || !product_id) {
    const error = AppError.createError(
      "User ID and Product ID are required",
      400,
      status.BAD_REQUEST
    );
    return next(error);
  }

  const userFavorites = await UserFavorites.findOne({ userId });

  if (!userFavorites) {
    return res
      .status(400)
      .json({ message: "no favorites found for this user", data: [] });
  }

  userFavorites.favoriteProducts = userFavorites.favoriteProducts.filter(
    (id) => id.toString() !== product_id
  );

  await userFavorites.save();
  res
    .status(200)
    .json({ message: "Product removed from favorites", data: userFavorites });
};
//=====================exporting all controlles=====================
module.exports = {
  addFavoriteProduct,
  getAllFavoriteProducts,
  deleteFavoriteProduct,
};
