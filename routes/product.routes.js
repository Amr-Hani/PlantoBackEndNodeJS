const express = require("express");
const router = express.Router();

const productController = require("../controllers/product.controller.js");
const updateProductMiddleware = require("../middlewares/updateProductMiddleware.js");

router.route("/products").get(productController.getAllProduct);
router.route("/products/:id").get(productController.getProductByCode);
router.route("/products").post(productController.addProduct);
router
  .route("/products/:id")
  .put(updateProductMiddleware(), productController.updateProduct);
router.route("/products/:id").delete(productController.deleted);
// router
//   .route("/products/categorie/:catName")
//   .get(productController.getProductsByCategory);
// router.route("/products/tag/:tagName").get(productController.getProductsByTag);

router
  .route("/products/:dynamicParam/:paramName")
  .get(productController.getProductsByPram);

module.exports = router;
