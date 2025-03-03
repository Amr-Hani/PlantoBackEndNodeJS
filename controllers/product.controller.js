const aysncWrapper = require("../middlewares/errorHandler.js");
const status = require("../utils/httpStatusText.js");
const Product = require("../models/product.model.js");
const AppError = require("../utils/appErrors.js");
// const bcrypt = require("bcryptjs");
// const generateJWT = require("../utils/generateJWT.js");
// const { validationResult } = require("express-validator");

const getAllProduct = aysncWrapper(async (req, res, next) => {
  const product = await Product.find();
  console.log(product);
  res.json({ status: "sucsess", data: product });
});
const addProduct = aysncWrapper(async (req, res, next) => {
  console.log("body", req.body);
  const oldProduct = await Product.findOne({
    productCode: req.body.productCode,
  });
  console.log("oldProduct", oldProduct);
  if (oldProduct) {
    const error = AppError.createError(
      "Product already exists",
      400,
      status.BAD_REQUEST
    );
    return next(error);
  }
  const product = new Product({ ...req.body });
  await product.save();
  res.status(201).json({ status: status.CREATED, data: { product } });
});
module.exports = { getAllProduct, addProduct };
