const aysncWrapper = require("../middlewares/errorHandler.js");
const status = require("../utils/httpStatusText.js");
const AppError = require("../utils/appErrors.js");
const bcrypt = require("bcryptjs");
const UserFavorites = require("../models/userFavorites.model");
const jwt = require("jsonwebtoken");

//===============decode token to get user Id =====================
const getUserIdFromToken = (req) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Extract token
    console.log(req.headers.authorization);
    if (!token) return "mwlsh token";

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    return decoded; // Ensure JWT contains { userId: "..." }  ezay a3raf aeh elli mwgod hena
  } catch (error) {
    console.error("Invalid token:", error);
    return "7ssal moshkella fel decoding";
  }
};
//================================================================
const addFavoriteProduct = aysncWrapper(async (req, res) => {
  const userId = getUserIdFromToken(req);
  const { _id } = req.body;

  res.json({ product_id: _id, user_id: userId });

  //   if (!userId || !productId) {
  //     return res
  //       .status(400)
  //       .json({ message: "User ID and Product ID are required" });
  //   }

  //     let userFavorites = await UserFavorites.findOne({ userId });

  //     if (!userFavorites) {
  //       userFavorites = new UserFavorites({
  //         userId,
  //         favoriteProducts: [productId],
  //       });
  //     } else {
  //       if (!userFavorites.favoriteProducts.includes(productId)) {
  //         userFavorites.favoriteProducts.push(productId);
  //       } else {
  //         return res
  //           .status(400)
  //           .json({ message: "product already in favorites" });
  //       }
  //     }

  //     await userFavorites.save();
  //     res
  //       .status(200)
  //       .json({ message: "product added sucssfully to favorites", data: userFavorites });
});

//=====================exporting all controlles=====================
module.exports = {
  addFavoriteProduct,
};
