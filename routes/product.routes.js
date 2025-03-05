const express = require("express");
const router = express.Router();

const productController = require("../controllers/product.controller.js");
const updateProductMiddleware = require("../middlewares/updateProductMiddleware.js");

router.route("/products").get(productController.getAllProduct);
router.route("/products/:code").get(productController.getProductByCode);
router.route("/products").post(productController.addProduct);
router
  .route("/products/:code")
  .put(updateProductMiddleware(), productController.updateProduct);

router.route("/products/:code").delete(productController.deleted);

module.exports = router;
